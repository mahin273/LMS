const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectories based on file type
        let subDir = 'misc';
        if (file.mimetype.startsWith('image/')) {
            subDir = 'images';
        } else if (file.mimetype === 'application/pdf') {
            subDir = 'documents';
        } else if (file.mimetype.startsWith('video/')) {
            subDir = 'videos';
        }

        const destPath = path.join(uploadDir, subDir);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const safeName = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `${safeName}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Allowed: images, PDF, MP4'));
    }
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSize,
    },
});

module.exports = upload;
