import express from 'express';
import { 
    googleAuth, 
    registerUser, 
    login, 
    forgotPassword, 
    resetPassword,
    verifyOTP // 1. Thêm import này (chút nữa ta sẽ viết hàm này ở Controller)
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/registerUser', registerUser);
router.post('/verify-otp', verifyOTP); // 2. Thêm route này để Mobile gọi đến
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;