const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
    }],
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    lastAccessedLesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// One progress record per user per course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
progressSchema.index({ percentage: 1 });

module.exports = mongoose.model('Progress', progressSchema);
