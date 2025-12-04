const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
    },
    title: {
        type: String,
        required: [true, 'Lesson title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    contentType: {
        type: String,
        enum: ['video', 'pdf', 'text'],
        required: [true, 'Content type is required'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        // For video: YouTube/Vimeo URL
        // For pdf: file URL
        // For text: HTML content
    },
    order: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number, // in minutes
        default: 0,
    },
    isFree: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Auto-increment order for new lessons
lessonSchema.pre('save', async function (next) {
    if (this.isNew && this.order === 0) {
        const lastLesson = await this.constructor.findOne({ courseId: this.courseId })
            .sort({ order: -1 });
        this.order = lastLesson ? lastLesson.order + 1 : 1;
    }
    next();
});

// Indexes
lessonSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
