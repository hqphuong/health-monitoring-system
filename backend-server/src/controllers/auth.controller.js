import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

// Register User Controller
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

// --- GOOGLE AUTH ---
export const googleAuth = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) {
            return res.status(400).json({ status: "error", message: "Thiếu Google Token." });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await prisma.user.findUnique({ where: { email } });

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

        const token = jwt.sign(
            { user_id: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '365d' }
        );

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

// --- REGISTER USER (CÓ OTP) ---
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

      // 3. Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // --- SINH OTP ---
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

      // 4. Tạo User + HealthProfile + Lưu OTP bằng Transaction
      const user = await prisma.$transaction(async (prismaCtx) => {
        const newUser = await prismaCtx.user.create({
          data: {
            email: email,
            full_name: full_name,
            password: hashedPassword,
            reset_otp: otp,           
            otp_expires_at: expiresAt
          }
        });

        await prismaCtx.healthProfile.create({
          data: { user_id: newUser.user_id }
        });

        return newUser;
      });

      // ---------------- DEBUG CONSOLE ĐĂNG KÝ ----------------
      console.log("=========================================");
      console.log(`🚀 [REGISTER OTP] Email: ${email}`);
      console.log(`🔑 [REGISTER OTP] Mã xác nhận của bạn là: ${otp}`);
      console.log("=========================================");

      // 5. Gửi email xác nhận
      const htmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #4CAF50; text-align: center;">HealthGuard</h2>
              <p>Xin chào <b>${full_name}</b>,</p>
              <p>Cảm ơn bạn đã đăng ký HealthGuard. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất đăng ký:</p>
              <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
              </div>
              <p style="color: red; font-size: 14px;"><em>Mã có hiệu lực trong 5 phút.</em></p>
          </div>
      `;

      try {
          // Thực thi gửi mail nhưng không dùng await để tránh treo luồng nếu mail server chậm
          sendEmail(email, "Mã xác nhận đăng ký tài khoản - HealthGuard", htmlTemplate)
            .catch(err => console.error("❌ Mail Service Error:", err.message));
      } catch (e) {
          console.error("❌ Lỗi thực thi sendEmail:", e.message);
      }

      return res.status(201).json({
          status: "success",
          message: "Đăng ký thành công. Vui lòng kiểm tra email (hoặc console server) để lấy mã.",
          data: { 
              user: { user_id: user.user_id, email: user.email, full_name: user.full_name },
              debug_otp: otp 
          }
      });

  } catch (error) {
    console.error("❌ Lỗi đăng ký chi tiết:", error);
    return res.status(500).json({ status: "error", message: "Lỗi máy chủ: " + error.message });
  }
};

// --- LOGIN (GIỮ NGUYÊN) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập email và mật khẩu." });
        }

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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Email hoặc mật khẩu không đúng." });
        }

        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '365d' } 
        );

        return res.status(200).json({
            status: "success",
            message: "Đăng nhập thành công.",
            data: {
                user: { user_id: user.user_id, email: user.email, full_name: user.full_name },
                access_token: token
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

// --- FORGOT PASSWORD (CÓ OTP) ---
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: "error", message: "Vui lòng nhập email." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: "error", message: "Email không tồn tại trong hệ thống." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                reset_otp: otp,
                otp_expires_at: expiresAt
            }
        });

        // ---------------- DEBUG CONSOLE QUÊN MK ----------------
        console.log("=========================================");
        console.log(`🔓 [FORGOT PASSWORD] Email: ${email}`);
        console.log(`🔑 [FORGOT PASSWORD] Mã OTP khôi phục là: ${otp}`);
        console.log("=========================================");

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">HealthGuard</h2>
                <p>Xin chào,</p>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HealthGuard. Mã xác nhận (OTP) của bạn là:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="color: red; font-size: 14px;"><em>Lưu ý: Mã này chỉ có hiệu lực trong vòng 5 phút.</em></p>
                <p>Trân trọng,<br>Đội ngũ HealthGuard</p>
            </div>
        `;

        try {
            sendEmail(email, "Mã xác nhận khôi phục mật khẩu - HealthGuard", htmlTemplate)
                .catch(err => console.error("❌ Mail Service Error:", err.message));
        } catch (mailError) {
            console.error("❌ Lỗi thực thi sendEmail:", mailError.message);
        }

        return res.status(200).json({
            status: "success",
            message: "Mã OTP đã được gửi.",
            debug_otp: otp
        });

    } catch (error) {
        console.error("❌ Lỗi ForgotPassword:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

// --- RESET PASSWORD (XÁC THỰC OTP) ---
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập đủ thông tin." });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ status: "error", message: "User không tồn tại." });

        // 1. Kiểm tra mã OTP
        if (user.reset_otp !== otp) {
            return res.status(400).json({ status: "error", message: "Mã OTP không chính xác." });
        }

        // 2. Kiểm tra hết hạn
        if (user.otp_expires_at < new Date()) {
            return res.status(400).json({ status: "error", message: "Mã OTP đã hết hạn." });
        }

        // 3. Đổi mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                reset_otp: null,
                otp_expires_at: null
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Đặt lại mật khẩu thành công."
        });

    } catch (error) {
        console.error("❌ Lỗi ResetPassword:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

// --- VERIFY OTP (DÙNG ĐỂ XÁC THỰC SAU KHI ĐĂNG KÝ) ---
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: "error", message: "Vui lòng cung cấp email và mã OTP." });
        }

        // 1. Tìm user theo email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ status: "error", message: "Người dùng không tồn tại." });
        }

        // 2. Kiểm tra mã OTP (Sử dụng cột reset_otp như hàm registerUser đang dùng)
        if (user.reset_otp !== otp) {
            return res.status(400).json({ status: "error", message: "Mã OTP không chính xác." });
        }

        // 3. Kiểm tra hết hạn
        if (user.otp_expires_at && user.otp_expires_at < new Date()) {
            return res.status(400).json({ status: "error", message: "Mã OTP đã hết hạn." });
        }

        // 4. XÁC THỰC THÀNH CÔNG -> TẠO TOKEN
        // Đây là bước quan trọng để Mobile nhận được Token và không bị lỗi 401
        const token = jwt.sign(
            { user_id: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '365d' }
        );

        // 5. Xóa OTP sau khi xác thực thành công
        await prisma.user.update({
            where: { email },
            data: {
                reset_otp: null,
                otp_expires_at: null
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Xác thực tài khoản thành công.",
            data: {
                user: { 
                    user_id: user.user_id, 
                    email: user.email, 
                    full_name: user.full_name 
                },
                access_token: token // Trả Token về cho Mobile
            }
        });

    } catch (error) {
        console.error("❌ Lỗi VerifyOTP:", error);
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};