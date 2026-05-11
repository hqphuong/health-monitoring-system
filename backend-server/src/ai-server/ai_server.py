from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
import time
import logging

app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

logger = logging.getLogger(__name__)

# ===== LOAD MODEL & LOGGING =====
try:
    model = joblib.load("model.pkl")
    scaler = joblib.load("scaler.pkl")
    MODEL_READY = True
    logger.info("AI Model & Scaler loaded successfully")
except Exception as e:
    MODEL_READY = False
    logger.warning(f"AI Model load failed: {e}. Running in Rule-only mode.")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_ready": MODEL_READY,
        "timestamp": time.time()
    })

def extract_features(hr_seq, steps, stress):
    hr = np.array(hr_seq)
    avg = np.mean(hr)
    std = np.std(hr)
    trend = hr[-1] - hr[0]
    diffs = np.diff(hr)
    max_jump = np.max(np.abs(diffs)) if len(diffs) > 0 else 0

    # Feature vector 7 chiều: Bao quát cả trạng thái tĩnh và động lực học (dynamics)
    feature_vector = [hr[-1], steps, stress, avg, std, trend, max_jump]
    
    stats = {
        "avg": float(avg), "std": float(std), "trend": float(trend),
        "max_jump": float(max_jump), "current_hr": int(hr[-1]),
        "steps": int(steps), "stress": int(stress)
    }
    return feature_vector, stats

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        hr_seq = data.get("heart_rate_history", [])
        steps = data.get("steps", 0)
        stress = data.get("stress_level", 0)

        # Validate & clean dữ liệu
        hr_seq = [
            float(x)
            for x in hr_seq
            if isinstance(x, (int, float))
        ]

        if len(hr_seq) < 5:
            return jsonify({"risk_score": 0.1, "prediction": "insufficient", "reasons": ["need_more_data"]})

        features, stats = extract_features(hr_seq, steps, stress)
        logger.info(f"Features Vector: {features}")

        risk = 0.0
        reasons = []

        # ===== ML PROBABILITY (Sigmoid Normalization) =====
        if MODEL_READY:
            feature_df = pd.DataFrame([features], columns=[
                "heart_rate",
                "steps",
                "stress",
                "avg_hr",
                "std_hr",
                "trend",
                "max_jump"
            ])

            X_scaled = scaler.transform(feature_df)
            ml_pred = model.predict(X_scaled)[0]
            ml_score = model.decision_function(X_scaled)[0]
            
            # Chuyển đổi score sang xác suất rủi ro (Sigmoid-like)
            normalized = np.clip(-ml_score, -5, 5)
            ml_risk = 1 / (1 + np.exp(-normalized))
            risk += min(ml_risk, 0.6)
            if ml_pred == -1: reasons.append("ml_detected_anomaly")

        # ===== CONTEXT-AWARE RULES =====
        if steps < 20 and stats["current_hr"] > 100:
            risk += 0.3
            reasons.append("high_hr_resting")
        
        if stats["max_jump"] > 25:
            risk += 0.2
            reasons.append("sudden_hr_spike")

        final_risk = min(risk, 0.99)
        return jsonify({
            "risk_score": float(round(final_risk, 3)),
            "confidence": float(round(final_risk * 100, 2)),
            "prediction": "anomaly" if final_risk > 0.7 else "normal",
            "reasons": reasons,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"error": "internal_error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000)