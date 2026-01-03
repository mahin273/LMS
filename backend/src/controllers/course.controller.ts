import { Request, Response } from 'express';
import { Course, Enrollment, User, Badge, Lesson, LessonProgress } from '../models';

interface AuthRequest extends Request {
    user?: User;
}

export const getPublicCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.findAll({
            include: [
                { model: User, as: 'instructor', attributes: ['name'] }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const getEnrolledCourses = async (req: AuthRequest, res: Response) => {
    const studentId = req.user?.id;
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: User,
                    as: 'students',
                    where: { id: studentId },
                    through: { attributes: ['status', 'joinedAt'] }
                },
                { model: User, as: 'instructor', attributes: ['name'] },
                // Include badges?
                {
                    model: Badge,
                    as: 'badges',
                    where: { studentId },
                    required: false // Left join, as they might not have badges
                },
                { model: Lesson, as: 'lessons', attributes: ['id'] }
            ]
        });

        // Calculate progress manually since Sequelize aggregation with include is complex
        // Efficient enough for typical course load
        const coursesWithProgress = await Promise.all(courses.map(async (course: any) => {
            const totalLessons = course.lessons.length;
            if (totalLessons === 0) return { ...course.toJSON(), progress: 0 };

            const completedCount = await LessonProgress.count({
                where: {
                    studentId,
                    lessonId: course.lessons.map((l: any) => l.id)
                }
            });

            return {
                ...course.toJSON(),
                progress: Math.round((completedCount / totalLessons) * 100)
            };
        }));

        res.json(coursesWithProgress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }
};

export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
    const instructorId = req.user?.id;
    try {
        const courses = await Course.findAll({
            where: { instructorId },
            include: [
                // Count students?
                { model: User, as: 'students', attributes: ['id'] }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch instructor courses' });
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    const instructorId = req.user?.id;
    const { title, description } = req.body;
    try {
        const course = await Course.create({
            instructorId: instructorId!,
            title,
            description
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const enrollCourse = async (req: AuthRequest, res: Response) => {
    const studentId = req.user?.id;
    const { courseId } = req.params;
    try {
        const [enrollment, created] = await Enrollment.findOrCreate({
            where: { studentId, courseId },
            defaults: { studentId: studentId!, courseId, status: 'active', joinedAt: new Date() }
        });

        if (!created) {
            return res.status(400).json({ message: 'Already enrolled' });
        }
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: 'Enrollment failed' });
    }
}
