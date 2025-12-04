const { Progress, Lesson } = require('../models');
const badgeService = require('./badgeService');

/**
 * Get or create progress record for user in course
 */
const getOrCreateProgress = async (userId, courseId) => {
    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
        progress = await Progress.create({
            userId,
            courseId,
            completedLessons: [],
            percentage: 0,
        });
    }

    return progress;
};

/**
 * Mark a lesson as complete and update progress
 */
const markLessonComplete = async (userId, courseId, lessonId) => {
    // Get total lessons in course
    const totalLessons = await Lesson.countDocuments({ courseId });

    if (totalLessons === 0) {
        return null;
    }

    // Get or create progress
    let progress = await getOrCreateProgress(userId, courseId);

    // Check if already completed
    if (progress.completedLessons.includes(lessonId)) {
        return progress;
    }

    // Add lesson to completed
    progress.completedLessons.push(lessonId);
    progress.lastAccessedLesson = lessonId;
    progress.lastAccessedAt = new Date();

    // Calculate new percentage
    const completedCount = progress.completedLessons.length;
    progress.percentage = Math.round((completedCount / totalLessons) * 100);

    // Check if course completed
    if (progress.percentage === 100 && !progress.completedAt) {
        progress.completedAt = new Date();
    }

    await progress.save();

    // Check and award badges
    await badgeService.checkAndAwardBadges(userId, courseId, progress.percentage);

    return progress;
};

/**
 * Get progress for a user in a course
 */
const getProgress = async (userId, courseId) => {
    const progress = await Progress.findOne({ userId, courseId })
        .populate('completedLessons', 'title order')
        .populate('lastAccessedLesson', 'title order');

    if (!progress) {
        return {
            percentage: 0,
            completedLessons: [],
            lastAccessedLesson: null,
        };
    }

    return progress;
};

/**
 * Get all progress for a user
 */
const getUserProgress = async (userId) => {
    const progress = await Progress.find({ userId })
        .populate('courseId', 'title thumbnail')
        .sort({ lastAccessedAt: -1 });

    return progress;
};

/**
 * Reset progress for a course
 */
const resetProgress = async (userId, courseId) => {
    await Progress.findOneAndDelete({ userId, courseId });
    return true;
};

module.exports = {
    getOrCreateProgress,
    markLessonComplete,
    getProgress,
    getUserProgress,
    resetProgress,
};
