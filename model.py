import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import NearestNeighbors
import warnings
warnings.filterwarnings("ignore")


class PredictiveMaintenanceAIOnly:
    """
    PURE AI-BASED Predictive Maintenance (Simulation + AI)
    - Fault type: AI multi-class classifier (no thresholds)
    - Severity: AI classifier (healthy/warning/critical) (no thresholds)
    - RUL: AI regressor (no formula at prediction time)
    - Recommendation: kNN retrieval from similar training samples (no hard-coded rules)
    """

    def __init__(self, random_state=42):
        self.random_state = random_state

        self.scaler = StandardScaler()

        self.fault_model = RandomForestClassifier(
            n_estimators=300, random_state=random_state, class_weight="balanced"
        )
        self.severity_model = RandomForestClassifier(
            n_estimators=300, random_state=random_state, class_weight="balanced"
        )
        self.rul_model = RandomForestRegressor(
            n_estimators=400, random_state=random_state
        )

        self.nn = NearestNeighbors(n_neighbors=7)

        self.is_trained = False
        self.train_df = None  # store training samples for retrieval

        self.feature_cols = ["temperature", "vibration", "pressure", "rpm"]

    # ----------------------------
    # 1) SIMULATION (DATASET)
    # ----------------------------
    def generate_synthetic_dataset(self, n_samples=30000, max_life_hours=1000):
        """
        Generate synthetic labeled data:
        - fault_type: healthy / overheating / imbalance / leakage / overspeed / mixed
        - severity: healthy / warning / critical
        - rul_hours: remaining useful life
        Recommendation text is part of the dataset and later retrieved via kNN.
        """
        rng = np.random.default_rng(self.random_state)

        # Latent variables (not visible to the model)
        # age: device age in hours
        age = rng.uniform(0, max_life_hours, n_samples)
        rul = np.clip(max_life_hours - age, 0, max_life_hours)

        # operating condition factors
        load = rng.uniform(0.3, 1.2, n_samples)     # affects vibration/temp
        ambient = rng.uniform(15, 45, n_samples)     # affects temperature
        stress = rng.uniform(0.0, 1.0, n_samples)    # generic stress factor

        # fault driver intensities (latent)
        # These create overlapping patterns so simple thresholds won't work reliably.
        overheat_int = rng.beta(2, 5, n_samples) * stress
        imbalance_int = rng.beta(2, 5, n_samples) * stress
        leakage_int = rng.beta(2, 5, n_samples) * stress
        overspeed_int = rng.beta(2, 5, n_samples) * stress

        # Probability of different fault types increases with age + stress
        # (Still simulation-side; prediction-time has no rules)
        p_fault = 1 / (1 + np.exp(-( (age/max_life_hours)*3 + stress*2 - 2.2 )))  # 0..1
        fault_draw = rng.uniform(0, 1, n_samples) < p_fault

        # Assign fault type (healthy or one/mixed)
        fault_type = np.array(["healthy"] * n_samples, dtype=object)

        # When faulty, pick a dominant mode, sometimes "mixed"
        modes = np.array(["overheating", "imbalance", "leakage", "overspeed", "mixed"], dtype=object)
        mode_probs = np.column_stack([
            0.28 + 0.30 * overheat_int,
            0.28 + 0.30 * imbalance_int,
            0.22 + 0.25 * leakage_int,
            0.12 + 0.20 * overspeed_int,
            0.10 + 0.20 * stress
        ])
        mode_probs = mode_probs / mode_probs.sum(axis=1, keepdims=True)

        chosen = np.array([rng.choice(modes, p=mode_probs[i]) for i in range(n_samples)])
        fault_type[fault_draw] = chosen[fault_draw]

        # Severity label (learned target)
        # We create severity from latent "damage" (again: only used to label training data)
        damage = (age/max_life_hours) * 0.6 + stress * 0.4
        sev = np.array(["healthy"] * n_samples, dtype=object)
        sev[(damage > 0.45) & (damage <= 0.72)] = "warning"
        sev[(damage > 0.72)] = "critical"
        # ensure healthy fault_type usually maps to healthy severity but allow some noise
        healthy_mask = fault_type == "healthy"
        sev[healthy_mask] = np.where(rng.uniform(0,1,healthy_mask.sum()) < 0.96, "healthy", sev[healthy_mask])

        # Sensor generation (overlapping distributions)
        # Base signals
        temperature = 40 + 12*load + 0.5*(ambient-25) + 8*(age/max_life_hours) + rng.normal(0, 3, n_samples)
        vibration = 1.8 + 1.5*load + 1.8*(age/max_life_hours) + rng.normal(0, 0.5, n_samples)
        pressure = 140 - 20*load - 15*(age/max_life_hours) + rng.normal(0, 6, n_samples)
        rpm = 2100 + 250*(load-0.7) + rng.normal(0, 120, n_samples)

        # Inject fault effects (still overlapping, not simple thresholds)
        temperature += (fault_type == "overheating") * (18*overheat_int + 10*(age/max_life_hours))
        vibration += (fault_type == "imbalance") * (2.5*imbalance_int + 1.2*(age/max_life_hours))
        pressure -= (fault_type == "leakage") * (25*leakage_int + 10*(age/max_life_hours))
        rpm += (fault_type == "overspeed") * (350*overspeed_int)

        # Mixed faults: combination
        is_mixed = (fault_type == "mixed")
        temperature += is_mixed * (12*overheat_int)
        vibration += is_mixed * (1.8*imbalance_int)
        pressure -= is_mixed * (18*leakage_int)
        rpm += is_mixed * (220*overspeed_int)

        # Recommendations stored as "historical actions" to retrieve later (kNN)
        rec_map = {
            "healthy": "No action needed. Continue monitoring.",
            "overheating": "Inspect cooling path, airflow, and thermal interface.",
            "imbalance": "Check alignment/bearings and perform vibration balancing.",
            "leakage": "Inspect seals/valves and verify pressure integrity.",
            "overspeed": "Verify controller limits and inspect drivetrain load conditions.",
            "mixed": "Run full inspection: thermal + vibration + pressure subsystems."
        }
        recommendation = np.array([rec_map[x] for x in fault_type], dtype=object)

        df = pd.DataFrame({
            "temperature": temperature,
            "vibration": vibration,
            "pressure": pressure,
            "rpm": rpm,
            "fault_type": fault_type,
            "severity": sev,
            "rul_hours": rul,
            "recommendation": recommendation
        })

        return df

    # ----------------------------
    # 2) TRAIN MODELS
    # ----------------------------
    def train(self, n_samples=30000):
        print("Training PURE AI-based models (fault type, severity, RUL, retrieval)...")

        df = self.generate_synthetic_dataset(n_samples=n_samples)
        self.train_df = df.copy()

        X = df[self.feature_cols].values
        y_fault = df["fault_type"].values
        y_sev = df["severity"].values
        y_rul = df["rul_hours"].values

        X_scaled = self.scaler.fit_transform(X)

        # Train models
        self.fault_model.fit(X_scaled, y_fault)
        self.severity_model.fit(X_scaled, y_sev)
        self.rul_model.fit(X_scaled, y_rul)

        # Train retrieval index (kNN)
        self.nn.fit(X_scaled)

        self.is_trained = True
        print("Training completed.")

    # ----------------------------
    # 3) PREDICT (NO RULES)
    # ----------------------------
    def predict(self, sensor_data: dict):
        """
        sensor_data keys: temperature, vibration, pressure, rpm
        Returns AI outputs (no hard-coded thresholds).
        """
        if not self.is_trained:
            self.train()

        # Build input
        x = np.array([[sensor_data[c] for c in self.feature_cols]], dtype=float)
        x_scaled = self.scaler.transform(x)

        # Fault type + probabilities
        fault_pred = self.fault_model.predict(x_scaled)[0]
        fault_proba = self.fault_model.predict_proba(x_scaled)[0]
        fault_classes = self.fault_model.classes_
        fault_prob_map = {cls: float(prob) for cls, prob in zip(fault_classes, fault_proba)}

        # Severity (learned)
        sev_pred = self.severity_model.predict(x_scaled)[0]
        sev_proba = self.severity_model.predict_proba(x_scaled)[0]
        sev_classes = self.severity_model.classes_
        sev_prob_map = {cls: float(prob) for cls, prob in zip(sev_classes, sev_proba)}

        # RUL regression (learned)
        rul_pred = float(self.rul_model.predict(x_scaled)[0])
        rul_pred = max(0.0, rul_pred)

        # Retrieval-based recommendation (data-driven)
        dists, idxs = self.nn.kneighbors(x_scaled, n_neighbors=7)
        neighbors = self.train_df.iloc[idxs[0]]
        # choose the most common recommendation among neighbors
        rec = neighbors["recommendation"].value_counts().idxmax()

        return {
            "predicted_fault_type": fault_pred,
            "fault_probabilities": {k: round(v, 3) for k, v in sorted(fault_prob_map.items(), key=lambda x: -x[1])},
            "predicted_severity": sev_pred,
            "severity_probabilities": {k: round(v, 3) for k, v in sorted(sev_prob_map.items(), key=lambda x: -x[1])},
            "predicted_rul_hours": int(round(rul_pred)),
            "recommendation": rec
        }


if __name__ == "__main__":
    model = PredictiveMaintenanceAIOnly()
    model.train(n_samples=25000)

    # Example test input (you can change values)
    sample = {
        "temperature": 92,
        "vibration": 6.5,
        "pressure": 85,
        "rpm": 3100
    }

    out = model.predict(sample)
    print("\n--- AI Prediction ---")
    for k, v in out.items():
        print(k, ":", v)
