const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: [true, 'Assignment ID is required'],
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required'],
    },
    fileUrl: {
        type: String,
        required: [true, 'Submission file is required'],
    },
    fileName: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        default: '',
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        enum: ['pending', 'graded'],
        default: 'pending',
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    gradedAt: {
        type: Date,
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// One submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
