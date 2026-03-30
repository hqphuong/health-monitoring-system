/**
 * Đánh giá chỉ số sức khỏe dựa trên chuẩn y khoa
 * @param {Object} metric - Dữ liệu sức khỏe (heart_rate, steps, sleep_duration...)
 * @param {Number} userAge - Tuổi của user (dùng tính HR_max theo công thức sinh lý học)
 * @param {Boolean} isResting - Trạng thái của user (có đang tập luyện không)
 */
export const evaluateHealthData = (metric, userAge = 25, isResting = true) => {
    let isSOS = false;
    let isWarning = false;
    let warningMessages = [];

    // ==========================================
    // 1. KIỂM TRA NHỊP TIM 
    // ==========================================
    if (metric.heart_rate) {
        const hr = metric.heart_rate;

        if (isResting) {
            // Ngưỡng nguy hiểm (Khủng hoảng) 
            if (hr >= 130 || hr < 40) {
                isSOS = true;
                warningMessages.push(`Nhịp tim nghỉ ngơi mức NGUY HIỂM (${hr} BPM)`);
            } 
            // Nhịp tim nhanh/chậm bất thường (Tachycardia / Bradycardia)
            else if (hr > 100 || hr < 50) {
                isWarning = true;
                warningMessages.push(`Nhịp tim nghỉ ngơi bất thường (${hr} BPM)`);
            }
        } else {
            // Đang vận động: Tính nhịp tim tối đa theo độ tuổi 
            const hrMax = 220 - userAge; // Công thức: HR_max = 220 - Age 
            if (hr >= hrMax) {
                isSOS = true;
                warningMessages.push(`Nhịp tim chạm ngưỡng chịu đựng tối đa (${hr} BPM)`);
            }
        }
    }

    // ==========================================
    // 2. KIỂM TRA HUYẾT ÁP 
    // ==========================================
    if (metric.systolic_bp && metric.diastolic_bp) {
        const sys = metric.systolic_bp;
        const dia = metric.diastolic_bp;

        if (isResting) {
            // Khủng hoảng huyết áp 
            if (sys >= 180 || dia >= 120) {
                isSOS = true;
                warningMessages.push(`KHỦNG HOẢNG HUYẾT ÁP (${sys}/${dia} mmHg)`);
            }
            // Cao huyết áp Giai đoạn 1 & 2 
            else if (sys >= 130 || dia >= 80) {
                isWarning = true;
                warningMessages.push(`Huyết áp đang ở mức cao (${sys}/${dia} mmHg)`);
            }
        } else {
            // Vận động: Ngưỡng nguy hiểm 
            if (sys > 220 || dia > 110) {
                isSOS = true;
                warningMessages.push(`Huyết áp vận động MỨC NGUY HIỂM (${sys}/${dia} mmHg)`);
            }
        }
    }

    // ==========================================
    // 3. KIỂM TRA SpO2 (Oxy trong máu)
    // ==========================================
    if (metric.raw_data && metric.raw_data.spo2) {
        const spo2 = metric.raw_data.spo2;
        // Cảnh báo hội chứng ngưng thở hoặc suy hô hấp
        if (spo2 < 90) {
            isSOS = true;
            warningMessages.push(`Oxy trong máu tụt nghiêm trọng (${spo2}%)`);
        } else if (spo2 >= 90 && spo2 <= 94) {
            isWarning = true;
            warningMessages.push(`Oxy trong máu thấp, cần chú ý (${spo2}%)`);
        }
    }

    // ==========================================
    // 4. KIỂM TRA CĂNG THẲNG (Stress Level)
    // ==========================================
    if (metric.stress_level && metric.stress_level >= 80) {
        isWarning = true;
        warningMessages.push(`Mức căng thẳng rất cao (${metric.stress_level}/100)`);
    }

    // ==========================================
    // TỔNG HỢP KẾT QUẢ ĐẦU RA
    // ==========================================
    if (isSOS) {
        return { 
            level: "SOS", 
            message: `KÍCH HOẠT CẤP CỨU: ${warningMessages.join(" - ")}. Hệ thống đang gọi người thân!` 
        };
    }
    
    if (isWarning) {
        return { 
            level: "WARNING", 
            message: `Cảnh báo: ${warningMessages.join(" - ")}. Vui lòng điều chỉnh cường độ hoạt động.` 
        };
    }

    return { 
        level: "NORMAL", 
        message: "Các chỉ số cơ thể đang ở trạng thái an toàn." 
    };
};