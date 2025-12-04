module.exports = {
    // JWT Configuration
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
        refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    },

    // File Upload Configuration
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'],
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },

    // Badge Thresholds
    badges: {
        bronze: 25,
        silver: 50,
        gold: 90,
        master: 100,
    },

    // User Roles
    roles: {
        STUDENT: 'student',
        INSTRUCTOR: 'instructor',
        ADMIN: 'admin',
    },
};
