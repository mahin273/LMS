
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../config/upload';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('instructor', 'admin'), upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL relative to the server
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

export default router;
