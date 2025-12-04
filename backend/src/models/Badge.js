const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'master'],
        required: [true, 'Badge tier is required'],
    },
    earnedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// One badge per tier per user per course
badgeSchema.index({ userId: 1, courseId: 1, tier: 1 }, { unique: true });
badgeSchema.index({ userId: 1 });
badgeSchema.index({ tier: 1 });

module.exports = mongoose.model('Badge', badgeSchema);
