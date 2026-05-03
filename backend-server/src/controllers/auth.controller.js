import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

// Register User Controller
<<<<<<< HEAD
// Thay CLIENT_ID bằng ID thật lấy từ Google Cloud Console
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

=======
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

// --- GOOGLE AUTH ---
>>>>>>> origin/FE
export const googleAuth = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) {
            return res.status(400).json({ status: "error", message: "Thiếu Google Token." });
        }

<<<<<<< HEAD
        // 1. Xác minh token với Server của Google (Chống hacker làm giả)
=======
>>>>>>> origin/FE
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

<<<<<<< HEAD
        // 2. Tìm xem email này đã có trong Database chưa
        let user = await prisma.user.findUnique({ where: { email } });

        // 3. LUỒNG ĐĂNG KÝ (Nếu chưa có tài khoản -> Tự động tạo)
=======
        let user = await prisma.user.findUnique({ where: { email } });

>>>>>>> origin/FE
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

<<<<<<< HEAD
        // 4. LUỒNG ĐĂNG NHẬP (Dù là user mới tạo hay user cũ, đều chạy xuống đây để lấy Token)
=======
>>>>>>> origin/FE
        const token = jwt.sign(
            { user_id: user.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '365d' }
        );

<<<<<<< HEAD
        // Trả kết quả về cho App Mobile
=======
>>>>>>> origin/FE
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
<<<<<<< HEAD
        console.error("Lỗi xác thực Google:", error);
=======
        //console.error("Lỗi xác thực Google:", error);
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

<<<<<<< HEAD
=======
// --- REGISTER USER (CÓ OTP) ---
>>>>>>> origin/FE
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

<<<<<<< HEAD
      // 3. Hash mật khẩu (Cost factor = 10)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Tạo User + HealthProfile bằng Transaction
=======
      // 3. Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // --- SINH OTP ---
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

      // 4. Tạo User + HealthProfile + Lưu OTP bằng Transaction
>>>>>>> origin/FE
      const user = await prisma.$transaction(async (prismaCtx) => {
        const newUser = await prismaCtx.user.create({
          data: {
            email: email,
            full_name: full_name,
            password: hashedPassword,
<<<<<<< HEAD
=======
            reset_otp: otp,           
            otp_expires_at: expiresAt
>>>>>>> origin/FE
          }
        });

        await prismaCtx.healthProfile.create({
          data: { user_id: newUser.user_id }
        });

        return newUser;
      });

<<<<<<< HEAD
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
    return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
  }
};

// Login Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra xem user có nhập đủ không
=======
      // ---------------- DEBUG //console ĐĂNG KÝ ----------------
      //console.log("=========================================");
      //console.log(`🚀 [REGISTER OTP] Email: ${email}`);
      //console.log(`🔑 [REGISTER OTP] Mã xác nhận của bạn là: ${otp}`);
      //console.log("=========================================");

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
          message: "Đăng ký thành công. Vui lòng kiểm tra email (hoặc //console server) để lấy mã.",
          data: { 
              user: { user_id: user.user_id, email: user.email, full_name: user.full_name },
              debug_otp: otp 
          }
      });

  } catch (error) {
    //console.error("❌ Lỗi đăng ký chi tiết:", error);
    return res.status(500).json({ status: "error", message: "Lỗi máy chủ: " + error.message });
  }
};

// --- LOGIN (GIỮ NGUYÊN) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
>>>>>>> origin/FE
        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập email và mật khẩu." });
        }

<<<<<<< HEAD
        // 2. Tìm user trong Database
=======
>>>>>>> origin/FE
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

<<<<<<< HEAD
        // 3. So sánh mật khẩu (Mật khẩu user gõ vs Mật khẩu đã băm trong DB)
=======
>>>>>>> origin/FE
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Email hoặc mật khẩu không đúng." });
        }

<<<<<<< HEAD
        // 4. MẬT MÃ DUY TRÌ ĐĂNG NHẬP: Cấp Token hạn 1 năm (365 days)
=======
>>>>>>> origin/FE
        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '365d' } 
        );

        return res.status(200).json({
            status: "success",
            message: "Đăng nhập thành công.",
            data: {
<<<<<<< HEAD
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    full_name: user.full_name
                },
=======
                user: { user_id: user.user_id, email: user.email, full_name: user.full_name },
>>>>>>> origin/FE
                access_token: token
            }
        });

    } catch (error) {
<<<<<<< HEAD
        console.error("Lỗi đăng nhập:", error);
=======
        //console.error("Lỗi đăng nhập:", error);
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

<<<<<<< HEAD
=======
// --- FORGOT PASSWORD (CÓ OTP) ---
>>>>>>> origin/FE
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: "error", message: "Vui lòng nhập email." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
<<<<<<< HEAD
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
=======
            return res.status(404).json({ status: "error", message: "Email không tồn tại trong hệ thống." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

>>>>>>> origin/FE
        await prisma.user.update({
            where: { email },
            data: {
                reset_otp: otp,
                otp_expires_at: expiresAt
            }
        });

<<<<<<< HEAD
        // 4. Thiết kế giao diện bức thư HTML
=======
        // ---------------- DEBUG //console QUÊN MK ----------------
        //console.log("=========================================");
        //console.log(`🔓 [FORGOT PASSWORD] Email: ${email}`);
        //console.log(`🔑 [FORGOT PASSWORD] Mã OTP khôi phục là: ${otp}`);
        //console.log("=========================================");

>>>>>>> origin/FE
        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">HealthGuard</h2>
                <p>Xin chào,</p>
<<<<<<< HEAD
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HealthGuard của mình. Dưới đây là mã xác nhận (OTP) của bạn:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="color: red; font-size: 14px;"><em>Lưu ý: Mã này chỉ có hiệu lực trong vòng 5 phút. KHÔNG chia sẻ mã này cho bất kỳ ai.</em></p>
=======
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HealthGuard. Mã xác nhận (OTP) của bạn là:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="color: red; font-size: 14px;"><em>Lưu ý: Mã này chỉ có hiệu lực trong vòng 5 phút.</em></p>
>>>>>>> origin/FE
                <p>Trân trọng,<br>Đội ngũ HealthGuard</p>
            </div>
        `;

<<<<<<< HEAD
        // 5. Giao cho anh "Người đưa thư" đi gửi
        await sendEmail(email, "Mã xác nhận khôi phục mật khẩu - HealthGuard", htmlTemplate);

        return res.status(200).json({
            status: "success",
            message: "Mã OTP đã được gửi đến email của bạn."
        });

    } catch (error) {
        console.error(error);
=======
        try {
            sendEmail(email, "Mã xác nhận khôi phục mật khẩu - HealthGuard", htmlTemplate)
                .catch(err => console.error("❌ Mail Service Error:", err.message));
        } catch (mailError) {
            //console.error("❌ Lỗi thực thi sendEmail:", mailError.message);
        }

        return res.status(200).json({
            status: "success",
            message: "Mã OTP đã được gửi.",
            debug_otp: otp
        });

    } catch (error) {
        //console.error("❌ Lỗi ForgotPassword:", error);
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};

<<<<<<< HEAD
=======
// --- RESET PASSWORD (XÁC THỰC OTP) ---
>>>>>>> origin/FE
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({ status: "error", message: "Vui lòng nhập đủ thông tin." });
        }

<<<<<<< HEAD
        // 1. Tìm user bằng email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ status: "error", message: "User không tồn tại." });

        // 2. Kiểm tra mã OTP có khớp không
=======
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ status: "error", message: "User không tồn tại." });

        // 1. Kiểm tra mã OTP
>>>>>>> origin/FE
        if (user.reset_otp !== otp) {
            return res.status(400).json({ status: "error", message: "Mã OTP không chính xác." });
        }

<<<<<<< HEAD
        // 3. Kiểm tra OTP có bị quá hạn không (Quá 5 phút)
        if (user.otp_expires_at < new Date()) {
            return res.status(400).json({ status: "error", message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
        }

        // 4. Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // 5. Lưu mật khẩu mới và "HỦY" luôn mã OTP để không bị dùng lại lần 2
=======
        // 2. Kiểm tra hết hạn
        if (user.otp_expires_at < new Date()) {
            return res.status(400).json({ status: "error", message: "Mã OTP đã hết hạn." });
        }

        // 3. Đổi mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

>>>>>>> origin/FE
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
<<<<<<< HEAD
                reset_otp: null,      // Dọn dẹp OTP
                otp_expires_at: null  // Dọn dẹp thời gian
=======
                reset_otp: null,
                otp_expires_at: null
>>>>>>> origin/FE
            }
        });

        return res.status(200).json({
            status: "success",
<<<<<<< HEAD
            message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
        });

    } catch (error) {
=======
            message: "Đặt lại mật khẩu thành công."
        });

    } catch (error) {
        //console.error("❌ Lỗi ResetPassword:", error);
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
        //console.error("❌ Lỗi VerifyOTP:", error);
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: "Lỗi máy chủ nội bộ." });
    }
};