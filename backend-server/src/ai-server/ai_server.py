from flask import Flask, request, jsonify
import numpy as np
import time

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "timestamp": time.time()
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        hr = data.get("heart_rate_history", [])

        if not isinstance(hr, list):
            return jsonify({"error": "invalid_input"}), 400

        if len(hr) < 3:
            return jsonify({
                "risk_score": 0.1,
                "prediction": "insufficient",
                "reason": "not enough data"
            })

        hr = np.array(hr)

        avg = np.mean(hr)
        std = np.std(hr)
        trend = hr[-1] - hr[0]
        min_hr = np.min(hr)
        max_hr = np.max(hr)

        # spike detection
        diffs = np.diff(hr)
        max_jump = np.max(np.abs(diffs)) if len(diffs) > 0 else 0

        risk = 0.1
        reasons = []

        # RULES
        if avg > 120:
            risk += 0.4
            reasons.append("high_avg_hr")

        if avg < 50:
            risk += 0.4
            reasons.append("low_avg_hr")

        if std > 15:
            risk += 0.2
            reasons.append("high_variability")

        if trend > 30:
            risk += 0.2
            reasons.append("increasing_trend")

        if max_jump > 25:
            risk += 0.2
            reasons.append("sudden_spike")

        if max_hr > 140:
            risk += 0.3
            reasons.append("extreme_hr")

        # normalize
        risk = min(max(risk, 0), 0.99)

        prediction = "anomaly" if risk > 0.7 else "normal"

        return jsonify({
            "risk_score": float(round(risk, 3)),
            "prediction": prediction,
            "stats": {
                "avg": float(avg),
                "std": float(std),
                "trend": float(trend),
                "min": int(min_hr),
                "max": int(max_hr),
                "max_jump": float(max_jump)
            },
            "reasons": reasons
        })

    except Exception as e:
        return jsonify({
            "error": "internal_error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    #app.run(port=8000)
    app.run(host='0.0.0.0', port=8000)