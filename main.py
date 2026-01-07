from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import uvicorn
from model import PredictiveMaintenanceAIOnly
import datetime

app = FastAPI(
    title="AI Predictive Maintenance API",
    description="Real-time equipment health monitoring and predictive maintenance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the predictive maintenance model
model = PredictiveMaintenanceAIOnly()

# In-memory storage for demo purposes (in production, use a database)
sensor_history = []
alerts = []

class SensorData(BaseModel):
    temperature: float = Field(..., ge=0, le=200, description="Temperature in °C")
    vibration: float = Field(..., ge=0, le=20, description="Vibration in mm/s")
    pressure: float = Field(..., ge=0, le=500, description="Pressure in PSI")
    rpm: float = Field(..., ge=0, le=5000, description="RPM")

class PredictionResponse(BaseModel):
    health_status: str
    failure_risk: int
    anomaly_detected: bool
    anomaly_probability: float
    root_cause: str
    recommendation: str
    remaining_useful_life: int
    timestamp: str

class Alert(BaseModel):
    id: int
    severity: str
    message: str
    timestamp: str
    sensor_data: Dict[str, float]

@app.on_event("startup")
async def startup_event():
    """Train the model on startup"""
    model.train()

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "AI Predictive Maintenance API",
        "version": "1.0.0",
        "endpoints": [
            "/predict - POST sensor data for prediction",
            "/history - GET sensor data history",
            "/alerts - GET current alerts",
            "/health - GET API health status"
        ]
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_maintenance(sensor_data: SensorData):
    """
    Predict equipment health based on sensor data using pure AI (no rule-based calculations)
    """
    try:
        data_dict = sensor_data.dict()

        # Get AI prediction
        ai_prediction = model.predict(data_dict)

        # Map AI outputs to expected API format
        health_status = ai_prediction["predicted_severity"].capitalize()

        # Calculate failure risk based on severity probabilities
        severity_probs = ai_prediction["severity_probabilities"]
        failure_risk = int((severity_probs.get("warning", 0) * 50 + severity_probs.get("critical", 0) * 100))
        failure_risk = max(0, min(100, failure_risk))  # Ensure within 0-100 range

        # If health status is Healthy, force failure risk to 0
        if health_status == "Healthy":
            failure_risk = 0

        # Determine anomaly detection
        anomaly_detected = health_status != "Healthy"
        anomaly_probability = round(severity_probs.get("warning", 0) + severity_probs.get("critical", 0), 3)

        # Format root cause from fault type
        fault_type = ai_prediction["predicted_fault_type"]
        if fault_type == "healthy":
            root_cause = "Normal operation"
        else:
            root_cause = fault_type.replace("_", " ").title()

        # Build complete prediction response
        prediction = {
            "health_status": health_status,
            "failure_risk": failure_risk,
            "anomaly_detected": anomaly_detected,
            "anomaly_probability": round(anomaly_probability, 3),
            "root_cause": root_cause,
            "recommendation": ai_prediction["recommendation"],
            "remaining_useful_life": ai_prediction["predicted_rul_hours"],
            "timestamp": datetime.datetime.now().isoformat()
        }

        # Store in history (keep last 1000 entries)
        sensor_history.append({
            "timestamp": prediction["timestamp"],
            "sensor_data": data_dict,
            "prediction": prediction
        })

        if len(sensor_history) > 1000:
            sensor_history.pop(0)

        # Generate alerts if necessary
        if prediction["health_status"] in ["Warning", "Critical"]:
            alert = Alert(
                id=len(alerts) + 1,
                severity="Critical" if prediction["health_status"] == "Critical" else "Warning",
                message=f"{prediction['health_status']}: {prediction['root_cause']} - {prediction['recommendation']}",
                timestamp=prediction["timestamp"],
                sensor_data=data_dict
            )
            alerts.append(alert)

            # Keep only last 50 alerts
            if len(alerts) > 50:
                alerts.pop(0)

        return prediction

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/history")
async def get_sensor_history(limit: Optional[int] = 50):
    """
    Get recent sensor data history
    """
    try:
        return sensor_history[-limit:] if limit else sensor_history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")

@app.get("/alerts")
async def get_alerts(severity: Optional[str] = None):
    """
    Get current alerts, optionally filtered by severity
    """
    try:
        if severity:
            filtered_alerts = [alert for alert in alerts if alert.severity.lower() == severity.lower()]
            return filtered_alerts
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    """
    Delete a specific alert
    """
    try:
        global alerts
        alerts = [alert for alert in alerts if alert.id != alert_id]
        return {"message": f"Alert {alert_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")

@app.get("/health")
async def health_check():
    """
    API health check
    """
    return {
        "status": "healthy",
        "model_trained": model.is_trained,
        "timestamp": datetime.datetime.now().isoformat(),
        "history_count": len(sensor_history),
        "alerts_count": len(alerts)
    }

@app.post("/reset")
async def reset_system():
    """
    Reset the system (clear history and alerts)
    """
    try:
        global sensor_history, alerts
        sensor_history = []
        alerts = []
        return {"message": "System reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
