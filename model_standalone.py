import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class PredictiveMaintenanceModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.normal_ranges = {
            'temperature': (20, 80),  # °C
            'vibration': (0, 5),      # mm/s
            'pressure': (50, 200),    # PSI
            'rpm': (1000, 3000)       # RPM
        }

    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic sensor data for training"""
        np.random.seed(42)

        # Generate normal data
        temperature = np.random.normal(50, 10, n_samples)
        vibration = np.random.normal(2.5, 1, n_samples)
        pressure = np.random.normal(125, 25, n_samples)
        rpm = np.random.normal(2000, 300, n_samples)

        # Add some anomalies (outliers)
        n_anomalies = int(n_samples * 0.05)  # 5% anomalies

        # High temperature anomalies
        temp_indices = np.random.choice(n_samples, n_anomalies//4, replace=False)
        temperature[temp_indices] = np.random.normal(95, 5, len(temp_indices))

        # High vibration anomalies
        vib_indices = np.random.choice(n_samples, n_anomalies//4, replace=False)
        vibration[vib_indices] = np.random.normal(8, 2, len(vib_indices))

        # Low pressure anomalies
        press_indices = np.random.choice(n_samples, n_anomalies//4, replace=False)
        pressure[press_indices] = np.random.normal(30, 10, len(press_indices))

        # High RPM anomalies
        rpm_indices = np.random.choice(n_samples, n_anomalies//4, replace=False)
        rpm[rpm_indices] = np.random.normal(3500, 200, len(rpm_indices))

        data = pd.DataFrame({
            'temperature': temperature,
            'vibration': vibration,
            'pressure': pressure,
            'rpm': rpm
        })

        return data

    def train_model(self):
        """Train the Isolation Forest model"""
        print("Training predictive maintenance model...")

        # Generate synthetic training data
        train_data = self.generate_synthetic_data()

        # Scale the data
        scaled_data = self.scaler.fit_transform(train_data)

        # Train Isolation Forest
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,  # Expected proportion of anomalies
            random_state=42,
            n_jobs=-1
        )

        self.model.fit(scaled_data)
        self.is_trained = True
        print("Model training completed.")

    def predict(self, sensor_data):
        """
        Predict equipment health from sensor data

        Args:
            sensor_data (dict): Dictionary with keys: temperature, vibration, pressure, rpm

        Returns:
            dict: Prediction results
        """
        if not self.is_trained:
            self.train_model()

        try:
            # Convert input to DataFrame
            input_df = pd.DataFrame([sensor_data])

            # Scale the input (handle potential scaling issues)
            scaled_input = self.scaler.transform(input_df)

            # Get anomaly score (-1 for anomaly, 1 for normal)
            anomaly_score = self.model.predict(scaled_input)[0]

            # Calculate anomaly probability
            anomaly_proba = self.model.decision_function(scaled_input)[0]

            # Handle potential numerical issues with sigmoid
            try:
                # decision_function returns negative values for anomalies, positive for normal
                # Convert to 0-1 scale where 1 is most anomalous
                # Use a more robust sigmoid implementation
                anomaly_probability = 1 / (1 + np.exp(-anomaly_proba))  # Note: negative sign for correct scaling
            except (OverflowError, ZeroDivisionError):
                # Fallback for numerical issues
                anomaly_probability = 1.0 if anomaly_score == -1 else 0.0

            # Ensure anomaly_probability is within valid range
            anomaly_probability = max(0.0, min(1.0, anomaly_probability))

            # Determine health status based on anomaly score and rule-based analysis
            rule_based_risk = self._calculate_rule_based_risk(sensor_data)
            failure_risk = int(max(anomaly_probability, rule_based_risk) * 100)

            # Ensure failure_risk is within valid range
            failure_risk = max(0, min(100, failure_risk))

            if failure_risk < 30:
                health_status = "Healthy"
            elif failure_risk < 70:
                health_status = "Warning"
            else:
                health_status = "Critical"

            # Determine root cause (rule-based)
            root_cause = self._determine_root_cause(sensor_data)

            # Generate recommendation
            recommendation = self._generate_recommendation(sensor_data, health_status)

            # Calculate Remaining Useful Life (simplified)
            rul = self._calculate_rul(sensor_data, anomaly_probability)

            return {
                "health_status": health_status,
                "failure_risk": failure_risk,
                "anomaly_detected": anomaly_score == -1,
                "anomaly_probability": round(anomaly_probability, 3),
                "root_cause": root_cause,
                "recommendation": recommendation,
                "remaining_useful_life": rul,
                "timestamp": pd.Timestamp.now().isoformat()
            }

        except Exception as e:
            # Fallback prediction based on rule-based analysis only
            print(f"ML prediction failed, using rule-based fallback: {str(e)}")

            rule_based_risk = self._calculate_rule_based_risk(sensor_data)
            failure_risk = int(rule_based_risk * 100)

            if failure_risk < 30:
                health_status = "Healthy"
            elif failure_risk < 70:
                health_status = "Warning"
            else:
                health_status = "Critical"

            root_cause = self._determine_root_cause(sensor_data)
            recommendation = self._generate_recommendation(sensor_data, health_status)
            rul = self._calculate_rul(sensor_data, rule_based_risk)

            return {
                "health_status": health_status,
                "failure_risk": failure_risk,
                "anomaly_detected": failure_risk >= 30,
                "anomaly_probability": round(rule_based_risk, 3),
                "root_cause": root_cause,
                "recommendation": recommendation,
                "remaining_useful_life": rul,
                "timestamp": pd.Timestamp.now().isoformat()
            }

    def _determine_root_cause(self, sensor_data):
        """Determine the most likely root cause of issues"""
        issues = []

        temp = sensor_data['temperature']
        vib = sensor_data['vibration']
        press = sensor_data['pressure']
        rpm_val = sensor_data['rpm']

        if temp > self.normal_ranges['temperature'][1]:
            issues.append("High temperature")
        elif temp < self.normal_ranges['temperature'][0]:
            issues.append("Low temperature")

        if vib > self.normal_ranges['vibration'][1]:
            issues.append("High vibration")

        if press > self.normal_ranges['pressure'][1]:
            issues.append("High pressure")
        elif press < self.normal_ranges['pressure'][0]:
            issues.append("Low pressure")

        if rpm_val > self.normal_ranges['rpm'][1]:
            issues.append("High RPM")
        elif rpm_val < self.normal_ranges['rpm'][0]:
            issues.append("Low RPM")

        if issues:
            return issues[0]  # Return the first detected issue
        else:
            return "Normal operation"

    def _generate_recommendation(self, sensor_data, health_status):
        """Generate maintenance recommendation based on sensor data and health status"""
        if health_status == "Healthy":
            return "Continue normal operation. Schedule routine maintenance."

        root_cause = self._determine_root_cause(sensor_data)

        recommendations = {
            "High temperature": "Check cooling system and ventilation. Clean heat sinks if necessary.",
            "Low temperature": "Verify heating system operation and insulation.",
            "High vibration": "Inspect bearings, check alignment, and lubricate moving parts.",
            "High pressure": "Check pressure relief valves and system calibration.",
            "Low pressure": "Inspect for leaks and verify pump operation.",
            "High RPM": "Check motor controls and reduce load if possible.",
            "Low RPM": "Inspect motor and drive system for issues.",
            "Normal operation": "Monitor closely for any changes in sensor readings."
        }

        base_rec = recommendations.get(root_cause, "Perform comprehensive system inspection.")

        if health_status == "Critical":
            return f"URGENT: {base_rec} Stop operation immediately and call maintenance team."
        elif health_status == "Warning":
            return f"WARNING: {base_rec} Schedule maintenance within 24 hours."

        return base_rec

    def _calculate_rule_based_risk(self, sensor_data):
        """Calculate risk based on rule-based analysis of sensor data"""
        risk_score = 0.0

        temp = sensor_data['temperature']
        vib = sensor_data['vibration']
        press = sensor_data['pressure']
        rpm_val = sensor_data['rpm']

        # Temperature risk
        if temp > self.normal_ranges['temperature'][1]:
            risk_score += 0.4  # High risk for high temperature
        elif temp < self.normal_ranges['temperature'][0]:
            risk_score += 0.2  # Moderate risk for low temperature

        # Vibration risk
        if vib > self.normal_ranges['vibration'][1]:
            risk_score += 0.5  # Very high risk for high vibration

        # Pressure risk
        if press > self.normal_ranges['pressure'][1]:
            risk_score += 0.3  # High risk for high pressure
        elif press < self.normal_ranges['pressure'][0]:
            risk_score += 0.4  # High risk for low pressure

        # RPM risk
        if rpm_val > self.normal_ranges['rpm'][1]:
            risk_score += 0.3  # High risk for high RPM
        elif rpm_val < self.normal_ranges['rpm'][0]:
            risk_score += 0.2  # Moderate risk for low RPM

        # Multiple issues increase overall risk
        issue_count = sum([
            temp > self.normal_ranges['temperature'][1] or temp < self.normal_ranges['temperature'][0],
            vib > self.normal_ranges['vibration'][1],
            press > self.normal_ranges['pressure'][1] or press < self.normal_ranges['pressure'][0],
            rpm_val > self.normal_ranges['rpm'][1] or rpm_val < self.normal_ranges['rpm'][0]
        ])

        if issue_count > 1:
            risk_score += 0.2  # Additional risk for multiple issues

        # Ensure risk is within valid range
        return max(0.0, min(1.0, risk_score))

    def _calculate_rul(self, sensor_data, anomaly_probability):
        """Calculate Remaining Useful Life (simplified estimation)"""
        # Simplified RUL calculation based on anomaly probability
        # Higher anomaly probability = lower RUL
        base_rul = 1000  # Base hours

        # Reduce RUL based on anomaly probability
        rul_reduction = anomaly_probability * 800  # Max reduction of 800 hours

        rul = max(10, base_rul - rul_reduction)  # Minimum 10 hours

        return int(rul)

    def validate_sensor_data(self, sensor_data):
        """Validate sensor data ranges - allow wide range for AI testing"""
        errors = []

        # Define absolute limits for safety
        absolute_limits = {
            'temperature': (0, 200),    # °C
            'vibration': (0, 20),       # mm/s
            'pressure': (0, 500),       # PSI
            'rpm': (0, 5000)            # RPM
        }

        for sensor, value in sensor_data.items():
            if sensor in absolute_limits:
                min_val, max_val = absolute_limits[sensor]
                if not (min_val <= value <= max_val):
                    errors.append(f"{sensor}: {value} is outside absolute safe range ({min_val}-{max_val})")

        return errors


def main():
    """Test the predictive maintenance model"""
    print("AI Predictive Maintenance Model Test")
    print("=" * 50)

    # Initialize model
    model = PredictiveMaintenanceModel()

    # Test data - normal operation
    test_cases = [
        {
            "name": "Normal Operation",
            "data": {
                "temperature": 50.0,
                "vibration": 2.5,
                "pressure": 125.0,
                "rpm": 2000
            }
        },
        {
            "name": "High Temperature Warning",
            "data": {
                "temperature": 85.0,
                "vibration": 2.5,
                "pressure": 125.0,
                "rpm": 2000
            }
        },
        {
            "name": "High Vibration Critical",
            "data": {
                "temperature": 50.0,
                "vibration": 8.0,
                "pressure": 125.0,
                "rpm": 2000
            }
        },
        {
            "name": "Multiple Issues Critical",
            "data": {
                "temperature": 90.0,
                "vibration": 7.0,
                "pressure": 180.0,
                "rpm": 3200
            }
        }
    ]

    # Run predictions
    for test_case in test_cases:
        print(f"\n{test_case['name']}:")
        print("-" * 30)

        # Display sensor readings
        data = test_case['data']
        print(f"Temperature: {data['temperature']}°C")
        print(f"Vibration: {data['vibration']} mm/s")
        print(f"Pressure: {data['pressure']} PSI")
        print(f"RPM: {data['rpm']}")

        # Make prediction
        prediction = model.predict(data)

        print("\nPrediction Results:")
        print(f"Health Status: {prediction['health_status']}")
        print(f"Failure Risk: {prediction['failure_risk']}%")
        print(f"Anomaly Detected: {prediction['anomaly_detected']}")
        print(f"Anomaly Probability: {prediction['anomaly_probability']}")
        print(f"Root Cause: {prediction['root_cause']}")
        print(f"Recommendation: {prediction['recommendation']}")
        print(f"Remaining Useful Life: {prediction['remaining_useful_life']} hours")

    print("\n" + "=" * 50)
    print("Model test completed!")


if __name__ == "__main__":
    main()
