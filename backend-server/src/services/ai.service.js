import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getRiskScore = async (hrSequence, latestMetric) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
            heart_rate_history: hrSequence,
            steps: latestMetric?.steps || 0,
            stress_level: latestMetric?.stress_level || 0
        }, { timeout: 2000 });
        // Check HTTP status
        if (response.status !== 200) {
            throw new Error("AI service failed");
        }

        return response.data;
    } catch (error) {
        console.error(">>> AI SERVICE ERROR:", error.message);
        return {
            risk_score: 0.1,
            prediction: "normal",
            reasons: ["ai_offline"],
            stats: { steps: latestMetric?.steps || 0, stress_level: latestMetric?.stress_level || 0 } // Tránh crash FE
        };
    }
};