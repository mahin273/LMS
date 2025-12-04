const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Get file URL from path
 */
const getFileUrl = (filePath) => {
    const relativePath = path.relative(path.resolve(config.upload.dir), filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

/**
 * Delete a file
 */
const deleteFile = async (fileUrl) => {
    try {
        const filePath = path.join(
            path.resolve(config.upload.dir),
            fileUrl.replace('/uploads/', '')
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Get file size in human-readable format
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 */
const isValidFileType = (mimetype) => {
    return config.upload.allowedTypes.includes(mimetype);
};

module.exports = {
    getFileUrl,
    deleteFile,
    formatFileSize,
    isValidFileType,
};
