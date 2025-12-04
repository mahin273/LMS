const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// One enrollment per user per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1 });

// Update course enrollment count on save
enrollmentSchema.post('save', async function () {
    const Course = mongoose.model('Course');
    const count = await this.constructor.countDocuments({ courseId: this.courseId });
    await Course.findByIdAndUpdate(this.courseId, { enrollmentCount: count });
});

// Update course enrollment count on remove
enrollmentSchema.post('deleteOne', { document: true, query: false }, async function () {
    const Course = mongoose.model('Course');
    const count = await this.constructor.countDocuments({ courseId: this.courseId });
    await Course.findByIdAndUpdate(this.courseId, { enrollmentCount: count });
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
