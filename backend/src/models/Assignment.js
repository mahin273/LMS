const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
    },
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Assignment description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    attachmentUrl: {
        type: String,
        default: '',
    },
    dueDate: {
        type: Date,
    },
    maxScore: {
        type: Number,
        default: 100,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for submission count
assignmentSchema.virtual('submissionCount', {
    ref: 'Submission',
    localField: '_id',
    foreignField: 'assignmentId',
    count: true,
});

// Indexes
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
