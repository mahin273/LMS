import { Request, Response } from 'express';
import { Lesson, LessonProgress, Course } from '../models';
import { GamificationService } from '../services/gamification.service';
import { User } from '../models';

interface AuthRequest extends Request {
    user?: User;
}

export const getLessons = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    try {
        const lessons = await Lesson.findAll({
            where: { courseId },
            order: [['orderIndex', 'ASC']]
        });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
};

export const createLesson = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { title, content, orderIndex } = req.body;
    try {
        const lesson = await Lesson.create({
            courseId,
            title,
            content, // Markdown
            orderIndex: orderIndex || 0
        });
        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
};

export const completeLesson = async (req: AuthRequest, res: Response) => {
    const { lessonId } = req.params;
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Verify lesson exists
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        // 2. Mark as complete (Idempotent)
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
