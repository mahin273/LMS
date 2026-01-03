import { Badge, Lesson, LessonProgress } from '../models';

export const GamificationService = {
    async checkAndAwardBadges(studentId: string, courseId: string) {
        // 1. Get total lessons count
        const totalLessons = await Lesson.count({ where: { courseId } });
        if (totalLessons === 0) return;

        // 2. Get completed lessons count
        const completedLessons = await LessonProgress.count({
            include: [
                {
                    model: Lesson,
                    as: 'completedBy', // Wait, this association might be tricky to query directly this way on count
                    where: { courseId },
                    required: true
                }
            ],
            where: { studentId }
        });

        // Better query: Find completions where the lesson belongs to the course
        // But since LessonProgress is a join table, we might need a raw query or correct include.
        // Let's rely on finding all lessons of the course first, then counting progress.
        const courseLessonIds = (await Lesson.findAll({ where: { courseId }, attributes: ['id'] })).map(l => l.id);

        const completedCount = await LessonProgress.count({
            where: {
                studentId,
                lessonId: courseLessonIds
            }
        });

        const progressPercent = (completedCount / totalLessons) * 100;

        console.log(`User ${studentId} progress in Course ${courseId}: ${progressPercent}%`);

        // 3. Define Milestones
        const milestones = [
            { type: 'BRONZE', threshold: 25 },
            { type: 'SILVER', threshold: 50 },
            { type: 'GOLD', threshold: 90 },
            { type: 'MASTER', threshold: 100 },
        ];

        // 4. Check and Award
        for (const milestone of milestones) {
            if (progressPercent >= milestone.threshold) {
                // Check if already awarded
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
                    console.log(`Awarded ${milestone.type} badge to ${studentId}`);
                }
            }
        }
    }
};
