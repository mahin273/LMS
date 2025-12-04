const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    thumbnail: {
        type: String,
        default: '',
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Instructor is required'],
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    category: {
        type: String,
        default: 'General',
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    enrollmentCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for lessons count
courseSchema.virtual('lessonsCount', {
    ref: 'Lesson',
    localField: '_id',
    foreignField: 'courseId',
    count: true,
});

// Indexes
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
