import express from 'express';
import { 
    googleAuth, 
    registerUser, 
    login, 
    forgotPassword, 
    resetPassword
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/registerUser', registerUser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;