import express from 'express';
import { 
    getRelatives,
    addRelative,
    updateRelative,
    deleteRelative
} from '../controllers/relative.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getRelatives);
router.post('/', verifyToken, addRelative);
router.patch('/:id', verifyToken, updateRelative);
router.delete('/:id', verifyToken, deleteRelative);

export default router;