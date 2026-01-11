import { Request, Response } from 'express';
import { Lesson, LessonProgress, Course, Enrollment } from '../models';
import { GamificationService } from '../services/gamification.service';
import { User } from '../models';


export const getLessons = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    try {

        if (userRole === 'student') {
            const enrollment = await Enrollment.findOne({
                where: { studentId: userId, courseId, status: 'active' }
            });
            if (!enrollment) {
                return res.status(403).json({ error: 'You must be enrolled to view lessons.' });
            }
        }

        const lessons = await Lesson.findAll({
            where: { courseId },
            order: [['orderIndex', 'ASC']]
        });

        // If Instructor, return all
        if (userRole !== 'student') {
            return res.json(lessons);
        }

        const progress = await LessonProgress.findAll({
            where: { studentId: userId }
        });
        const completedLessonIds = new Set(progress.map(p => p.lessonId));


        const lessonsWithStatus = lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.has(lesson.id);

            let isLocked = false;
            if (index > 0) {
                const prevLesson = lessons[index - 1];
                if (!completedLessonIds.has(prevLesson.id)) {
                    isLocked = true;
                }
            }

            if (isLocked) {
                return {
                    id: lesson.id,
                    title: lesson.title,
                    orderIndex: lesson.orderIndex,
                    isLocked: true,
                    // Mask content
                    content: 'Locked',
                    fileUrl: null,
                    videoUrl: null
                };
            }

            return {
                ...lesson.toJSON(),
                isCompleted,
                isLocked: false
            };
        });

        res.json(lessonsWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
};

export const createLesson = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { title, content, orderIndex, fileUrl, videoUrl } = req.body;
    console.log('createLesson Params:', req.params);
    console.log('createLesson Body:', req.body);
    try {
        const lesson = await Lesson.create({
            courseId,
            title,
            content, // Markdown
            orderIndex: orderIndex || 0,
            fileUrl,
            videoUrl
        });
        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const { title, content, orderIndex, fileUrl, videoUrl } = req.body;

    try {
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        if (orderIndex !== undefined) lesson.orderIndex = orderIndex;
        if (fileUrl !== undefined) lesson.fileUrl = fileUrl;
        if (videoUrl !== undefined) lesson.videoUrl = videoUrl;

        await lesson.save();
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lesson' });
    }
}

export const completeLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const studentId = (req as any).user?.id;

    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    try {

        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        const [progress, created] = await LessonProgress.findOrCreate({
            where: {
                studentId,
                lessonId
            },
            defaults: {
                studentId,
                lessonId,
                completedAt: new Date()
            }
        });

        // 3. Trigger Gamification Engine
        // Run asynchronously so we don't block the response?
        // Ideally yes, but for now we await to ensure correctness in this synchronous flow.
        await GamificationService.checkAndAwardBadges(studentId, lesson.courseId);

        res.json({ message: 'Lesson completed', progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to complete lesson' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    try {
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        await lesson.destroy();
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lesson' });
    }
};
