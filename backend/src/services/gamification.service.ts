import { Badge, Lesson, LessonProgress, Enrollment } from '../models';

// Points system for leaderboard
export const BADGE_POINTS = {
    BRONZE: 25,
    SILVER: 50,
    GOLD: 100,
    MASTER: 200
};

export const GamificationService = {
    async checkAndAwardBadges(studentId: string, courseId: string) {
        const totalLessons = await Lesson.count({ where: { courseId } });
        if (totalLessons === 0) return { newBadges: [] };

        const courseLessonIds = (await Lesson.findAll({ where: { courseId }, attributes: ['id'] })).map(l => l.id);

        const completedCount = await LessonProgress.count({
            where: {
                studentId,
                lessonId: courseLessonIds
            }
        });

        const progressPercent = (completedCount / totalLessons) * 100;

        console.log(`User ${studentId} progress in Course ${courseId}: ${progressPercent}%`);

        const milestones = [
            { type: 'BRONZE', threshold: 25 },
            { type: 'SILVER', threshold: 50 },
            { type: 'GOLD', threshold: 90 },
            { type: 'MASTER', threshold: 100 },
        ];

        const newBadges: string[] = [];

        for (const milestone of milestones) {
            if (progressPercent >= milestone.threshold) {
                const existingBadge = await Badge.findOne({
                    where: {
                        studentId,
                        courseId,
                        type: milestone.type as any
                    }
                });

                if (!existingBadge) {
                    await Badge.create({
                        studentId,
                        courseId,
                        type: milestone.type as any,
                        awardedAt: new Date()
                    });
                    newBadges.push(milestone.type);
                    console.log(`Awarded ${milestone.type} badge to ${studentId}`);
                }
            }
        }

        // Auto-update enrollment status when course is completed
        if (progressPercent === 100) {
            await Enrollment.update(
                { status: 'completed' },
                { where: { studentId, courseId } }
            );
            console.log(`Marked enrollment as completed for student ${studentId} in course ${courseId}`);
        }

        return { newBadges, progressPercent };
    },

    // Calculate total points for a student
    async calculateStudentPoints(studentId: string): Promise<number> {
        const badges = await Badge.findAll({ where: { studentId } });
        return badges.reduce((total, badge) => {
            return total + (BADGE_POINTS[badge.type] || 0);
        }, 0);
    }
};
