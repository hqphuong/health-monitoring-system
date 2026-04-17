import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        // Cấu hình "Bưu cục" Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Cấu hình "Bức thư"
        const mailOptions = {
            from: `"HealthGuard Support" <${process.env.EMAIL_USER}>`, 
            to: to, // Email người nhận
            subject: subject, // Tiêu đề thư
            html: htmlContent // Nội dung thư (hỗ trợ code HTML)
        };

        // Tiến hành gửi
        const info = await transporter.sendMail(mailOptions);
        //console.log("💌 Email đã được gửi thành công tới: " + info.accepted);
        return true;
    } catch (error) {
        //console.error("❌ Lỗi khi gửi email:", error);
        throw error;
    }
};