import express from 'express';
// Nhớ check lại đường dẫn import controller của bạn nhé
import { 
    googleAuth, 
    registerUser, 
    login, 
    forgotPassword, 
    resetPassword, 
    logout 
} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 * name: Auth
 * description: Các API quản lý xác thực người dùng
 */

/**
 * @swagger
 * /auth/google:
 * post:
 * summary: Đăng nhập bằng Google
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id_token:
 * type: string
 * responses:
 * 200:
 * description: Đăng nhập thành công
 */
router.post('/google', googleAuth);

/**
 * @swagger
 * /auth/registerUser:
 * post:
 * summary: Đăng ký tài khoản mới
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * - full_name
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * full_name:
 * type: string
 * responses:
 * 201:
 * description: Đăng ký thành công
 */
router.post('/registerUser', registerUser);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Đăng nhập hệ thống (Thủ công)
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * login_type:
 * type: string
 * default: manual
 * responses:
 * 200:
 * description: Đăng nhập thành công
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/forgot-password:
 * post:
 * summary: Yêu cầu gửi mã OTP khôi phục mật khẩu
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * responses:
 * 200:
 * description: Đã gửi mã OTP qua email
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 * post:
 * summary: Đặt lại mật khẩu bằng mã OTP
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * otp:
 * type: string
 * new_password:
 * type: string
 * responses:
 * 200:
 * description: Đặt lại mật khẩu thành công
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/logout:
 * post:
 * summary: Đăng xuất khỏi hệ thống
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Đăng xuất thành công
 * 401:
 * description: Chưa xác thực (Missing Token)
 */
router.post('/logout', logout);

export default router;