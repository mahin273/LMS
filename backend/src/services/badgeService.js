const { Badge } = require('../models');
const config = require('../config');

/**
 * Badge tier thresholds
 */
const BADGE_THRESHOLDS = {
    bronze: config.badges.bronze,   // 25%
    silver: config.badges.silver,   // 50%
    gold: config.badges.gold,       // 90%
    master: config.badges.master,   // 100%
};

/**
 * Get tier hierarchy (for determining which badges to award)
 */
const TIER_ORDER = ['bronze', 'silver', 'gold', 'master'];

/**
 * Check progress and award appropriate badges
 */
const checkAndAwardBadges = async (userId, courseId, percentage) => {
    const newBadges = [];

    for (const tier of TIER_ORDER) {
        const threshold = BADGE_THRESHOLDS[tier];

        if (percentage >= threshold) {
            // Check if badge already exists
            const existingBadge = await Badge.findOne({ userId, courseId, tier });

            if (!existingBadge) {
                // Award new badge
                const badge = await Badge.create({
                    userId,
                    courseId,
                    tier,
                });
                newBadges.push(badge);
            }
        }
    }

    return newBadges;
};

/**
 * Get all badges for a user
 */
const getUserBadges = async (userId) => {
    const badges = await Badge.find({ userId })
        .populate('courseId', 'title thumbnail')
        .sort({ earnedAt: -1 });

    return badges;
};

/**
 * Get badges for a specific course
 */
const getCourseBadges = async (userId, courseId) => {
    const badges = await Badge.find({ userId, courseId })
        .sort({ earnedAt: 1 });

    return badges;
};

/**
 * Get highest badge tier for a user in a course
 */
const getHighestBadge = async (userId, courseId) => {
    const badges = await Badge.find({ userId, courseId });

    if (badges.length === 0) {
        return null;
    }

    // Find highest tier
    let highestIndex = -1;
    let highestBadge = null;

    for (const badge of badges) {
        const index = TIER_ORDER.indexOf(badge.tier);
        if (index > highestIndex) {
            highestIndex = index;
            highestBadge = badge;
        }
    }

    return highestBadge;
};

/**
 * Get badge statistics for a user
 */
const getBadgeStats = async (userId) => {
    const badges = await Badge.find({ userId });

    const stats = {
        total: badges.length,
        bronze: 0,
        silver: 0,
        gold: 0,
        master: 0,
    };

    for (const badge of badges) {
        stats[badge.tier]++;
    }

    return stats;
};

module.exports = {
    checkAndAwardBadges,
    getUserBadges,
    getCourseBadges,
    getHighestBadge,
    getBadgeStats,
    BADGE_THRESHOLDS,
    TIER_ORDER,
};
