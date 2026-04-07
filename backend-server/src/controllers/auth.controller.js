import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

// Register User Controller
// Thay CLIENT_ID bằng ID thật lấy từ Google Cloud Console
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

export const googleAuth = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) {
            return res.status(400).json({ status: "error", message: "Thiếu Google Token." });
        }

        // 1. Xác minh token với Server của Google (Chống hacker làm giả)
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        // 2. Tìm xem email này đã có trong Database chưa
        let user = await prisma.user.findUnique({ where: { email } });

        // 3. LUỒNG ĐĂNG KÝ (Nếu chưa có tài khoản -> Tự động tạo)
        if (!user) {
            user = await prisma.$transaction(async (prismaCtx) => {
                const newUser = await prismaCtx.user.create({
                    data: {
                        email: email,
                        full_name: name
                    }
                });

                await prismaCtx.healthProfile.create({
                    data: { user_id: newUser.user_id }
                });

                return newUser;
            });
        }

        // 4. LUỒNG ĐĂNG NHẬP (Dù là user mới tạo hay user cũ, đều chạy xuống đây để lấy Token)
        const token = jwt.sign(
            { user_id: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '365d' }
        );

        // Trả kết quả về cho App Mobile
        return res.status(200).json({
            status: "success",
            message: "Xác thực Google thành công.",
            data: {
                user: { 
                    user_id: user.user_id, 
                    email: user.email, 
                    full_name: user.full_name 
                },
                access_token: token
            }
        });

    } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

export const registerUser = async (req, res) => {
  try {
      const { email, full_name, password, confirm_password } = req.body;

      // 1. Validate cơ bản
      if (!email || !password || !full_name || !confirm_password) {
        return res.status(400).json({ status: "error", message: "Vui lòng điền đầy đủ thông tin." });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ status: "error", message: "Mật khẩu xác nhận không khớp." });
      }

      // 2. Kiểm tra email trùng
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ status: "error", message: "Email đã tồn tại." });
      }

      // 3. Hash mật khẩu (Cost factor = 10)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Tạo User + HealthProfile bằng Transaction
      const user = await prisma.$transaction(async (prismaCtx) => {
        const newUser = await prismaCtx.user.create({
          data: {
            email: email,
            full_name: full_name,
            password: hashedPassword,
          }
        });

        await prismaCtx.healthProfile.create({
          data: { user_id: newUser.user_id }
        });

        return newUser;
      });

    // Nếu gửi type tào lao
    // return res.status(400).json({ status: "error", message: "Loại đăng ký không hợp lệ." });
    const token = jwt.sign(
        { user_id: user.user_id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '365d' }
    );
    
    return res.status(201).json({
        status: "success",
        message: "Đăng ký tài khoản thành công.",
        data: { 
            user: {
                user_id: user.user_id, 
                email: user.email, 
                full_name: user.full_name 
            },
            access_token: token 
        }
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ status: "error", message: "Lỗi máy chủ: " + error.message });
  }
};

// Login Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra xem user có nhập đủ không
        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập email và mật khẩu." });
        }

        // 2. Tìm user trong Database
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ status: "error", message: "Email hoặc mật khẩu không đúng." });
        }

        if (!user.password) {
            return res.status(400).json({ 
                status: "error", 
                message: "Tài khoản này được đăng ký bằng Google. Vui lòng chọn 'Đăng nhập bằng Google'." 
            });
        }

        // 3. So sánh mật khẩu (Mật khẩu user gõ vs Mật khẩu đã băm trong DB)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Email hoặc mật khẩu không đúng." });
        }

        // 4. MẬT MÃ DUY TRÌ ĐĂNG NHẬP: Cấp Token hạn 1 năm (365 days)
        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '365d' } 
        );

        return res.status(200).json({
            status: "success",
            message: "Đăng nhập thành công.",
            data: {
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    full_name: user.full_name
                },
                access_token: token
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: "error", message: "Vui lòng nhập email." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Bất kể email có tồn tại hay không, thực tế người ta hay trả về "Đã gửi mail"
            // để hacker không dò được email nào đang có trong hệ thống (Bảo mật Anti-Enumeration)
            // Nhưng ở đây làm demo nên sẽ trả về lỗi để dễ test, chứ thực tế nên trả về 200 dù email có tồn tại hay không.
            return res.status(404).json({ status: "error", message: "Email không tồn tại trong hệ thống." });
        }

        // 1. Sinh mã OTP ngẫu nhiên 6 chữ số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Cài đặt thời gian hết hạn (5 phút kể từ bây giờ)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 3. Lưu OTP và thời gian hết hạn vào Database
        await prisma.user.update({
            where: { email },
            data: {
                reset_otp: otp,
                otp_expires_at: expiresAt
            }
        });

        // 4. Thiết kế giao diện bức thư HTML
        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">HealthGuard</h2>
                <p>Xin chào,</p>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HealthGuard của mình. Dưới đây là mã xác nhận (OTP) của bạn:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="color: red; font-size: 14px;"><em>Lưu ý: Mã này chỉ có hiệu lực trong vòng 5 phút. KHÔNG chia sẻ mã này cho bất kỳ ai.</em></p>
                <p>Trân trọng,<br>Đội ngũ HealthGuard</p>
            </div>
        `;

        // 5. Giao cho anh "Người đưa thư" đi gửi
        await sendEmail(email, "Mã xác nhận khôi phục mật khẩu - HealthGuard", htmlTemplate);

        return res.status(200).json({
            status: "success",
            message: "Mã OTP đã được gửi đến email của bạn."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập đủ thông tin." });
        }

        // 1. Tìm user bằng email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ status: "error", message: "User không tồn tại." });

        // 2. Kiểm tra mã OTP có khớp không
        if (user.reset_otp !== otp) {
            return res.status(400).json({ status: "error", message: "Mã OTP không chính xác." });
        }

        // 3. Kiểm tra OTP có bị quá hạn không (Quá 5 phút)
        if (user.otp_expires_at < new Date()) {
            return res.status(400).json({ status: "error", message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
        }

        // 4. Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // 5. Lưu mật khẩu mới và "HỦY" luôn mã OTP để không bị dùng lại lần 2
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                reset_otp: null,      // Dọn dẹp OTP
                otp_expires_at: null  // Dọn dẹp thời gian
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};