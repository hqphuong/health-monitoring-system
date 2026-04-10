import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT = 2000; // 2 giây

/**
 * Gửi chuỗi dữ liệu nhịp tim sang Python AI Service để chấm điểm rủi ro
 * @param {Array<number>} hrSequence - Mảng nhịp tim gần nhất [72, 75, 80, ...]
 * @returns {Promise<{risk_score: number, prediction: string}>}
 */
export const getRiskScore = async (hrSequence) => {
    try {
        // 1. Validate input
        if (!Array.isArray(hrSequence) || hrSequence.length === 0) {
            return {
                risk_score: 0,
                prediction: "insufficient_data"
            };
        }

        // 2. Gọi AI service với timeout
        const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
            heart_rate_history: hrSequence
        }, {
            timeout: 2000
        });

        console.log("AI RESPONSE:", response.data);

        // 3. Validate response
        if (!response.data || typeof response.data.risk_score !== "number") {
            throw new Error("Invalid AI response");
        }

        return response.data;

    } catch (error) {
        console.error(">>> AI SERVICE ERROR:", error.code || error.message);

        return {
            risk_score: 0,
            status: "error"
        };
    }
};