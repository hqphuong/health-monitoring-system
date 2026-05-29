import express from 'express';
import { 
    getHealthProfile,
    updateHealthProfile
} from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getHealthProfile);
router.patch('/', verifyToken, updateHealthProfile);

export default router;