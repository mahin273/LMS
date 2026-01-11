import { Request, Response } from 'express';
import { Course, Enrollment, User, Badge, Lesson, LessonProgress, Assignment, Submission } from '../models';


export const getPublicCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.findAll({
            where: { status: 'published' },
            include: [
                { model: User, as: 'instructor', attributes: ['name'] },
                {
                    model: User,
                    as: 'students',
                    attributes: ['id'], // We just need IDs to count or use Sequelize.fn
                    through: { attributes: ['rating'] }
                }
            ]
        });

        // Calculate stats manually for now to avoid Group By complexify
        const coursesWithStats = courses.map((course: any) => {
            const enrollments = course.students || [];
            const count = enrollments.length;

            // Filter out null ratings
            const ratings = enrollments
                .map((s: any) => s.Enrollment?.rating)
                .filter((r: any) => r);

            const avg = ratings.length > 0
                ? (ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length).toFixed(1)
                : null;

            return {
                ...course.toJSON(),
                studentCount: count,
                averageRating: avg ? parseFloat(avg) : null,
                // Clean up students array to not expose all IDs publicly if unwanted
                students: undefined
            };
        });

        res.json(coursesWithStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const getEnrolledCourses = async (req: Request, res: Response) => {
    const studentId = (req as any).user?.id;
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

export const getInstructorCourses = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    try {
        const courses = await Course.findAll({
            where: { instructorId },
            include: [
                // Count students?
                { model: User, as: 'students', attributes: ['id', 'name', 'email'] }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch instructor courses' });
    }
};

export const getAllCoursesAdmin = async (req: Request, res: Response) => {
    try {
        const courses = await Course.findAll({
            include: [
                { model: User, as: 'instructor', attributes: ['name', 'email'] },
                { model: User, as: 'students', attributes: ['id'] }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all courses' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    const { title, description } = req.body;
    try {
        const course = await Course.create({
            instructorId: instructorId!,
            title,
            description,
            status: 'draft'
        });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const enrollCourse = async (req: Request, res: Response) => {
    const studentId = (req as any).user?.id;
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

export const unenrollCourse = async (req: Request, res: Response) => {
    const studentId = (req as any).user?.id;
    const { courseId } = req.params;
    try {
        const deleted = await Enrollment.destroy({
            where: { studentId, courseId }
        });

        if (deleted) {
            res.json({ message: 'Unenrolled successfully' });
        } else {
            res.status(404).json({ error: 'Enrollment not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unenrollment failed' });
    }
}

export const rateCourse = async (req: Request, res: Response) => {
    const studentId = (req as any).user?.id;
    const { courseId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
        const enrollment = await Enrollment.findOne({
            where: { studentId, courseId }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'You are not enrolled in this course' });
        }

        enrollment.rating = rating;
        enrollment.review = review;
        await enrollment.save();

        res.json({ message: 'Rating submitted successfully', enrollment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit rating' });
    }
}

export const deleteCourse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    try {
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Allow Admin or the Instructor who owns it
        if (user?.role !== 'admin' && course.instructorId !== user?.id) {
            return res.status(403).json({ error: 'Not authorized to delete this course' });
        }

        await course.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const user = (req as any).user;

    try {
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.instructorId !== user?.id && user?.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        course.title = title || course.title;
        course.description = description || course.description;
        await course.save();

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const getCourseAnalytics = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const course = await Course.findByPk(id, {
            include: [
                { model: User, as: 'students', attributes: ['id', 'name', 'email'] },
                { model: Lesson, as: 'lessons', attributes: ['id'] }
            ]
        });

        if (!course) return res.status(404).json({ error: 'Course not found' });

        const totalLessons = course.lessons?.length || 0;
        const analytics = await Promise.all((course.students || []).map(async (student: any) => {
            const completedCount = await LessonProgress.count({
                where: {
                    studentId: student.id,
                    lessonId: course.lessons?.map(l => l.id)
                }
            });

            const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return {
                student: { id: student.id, name: student.name, email: student.email },
                progress,
                completedLessons: completedCount,
                totalLessons
            };
        }));

        res.json(analytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export const updateCourseStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'published' | 'rejected'

    if (!['published', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        course.status = status;
        await course.save();

        res.json({ message: `Course ${status}`, course });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update course status' });
    }
};

export const submitCourse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const instructorId = (req as any).user?.id;

    try {
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if (course.instructorId !== instructorId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        course.status = 'pending';
        await course.save();

        res.json({ message: 'Course submitted for approval', course });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit course' });
    }
};

export const getInstructorStats = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    try {
        // 1. Get all courses owned by instructor
        const courses = await Course.findAll({
            where: { instructorId },
            include: [
                {
                    model: User,
                    as: 'students',
                    through: { attributes: ['rating', 'joinedAt'] }
                },
                {
                    model: Assignment,
                    as: 'assignments',
                    include: [{ model: Submission, as: 'submissions' }]
                }
            ]
        });

        // 2. Calculate quick stats
        const totalCourses = courses.length;

        const allStudents = courses.flatMap(c => c.students || []);
        // Unique students count
        const uniqueStudentIds = new Set(allStudents.map((s: any) => s.id));
        const totalStudents = uniqueStudentIds.size;

        // Pending Grading
        // Logic: Submissions where grade is null
        let pendingGrading = 0;
        let recentSubmissions: any[] = [];

        courses.forEach((course: any) => {
            if (course.assignments) {
                course.assignments.forEach((assignment: any) => {
                    if (assignment.submissions) {
                        assignment.submissions.forEach((sub: any) => {
                            if (sub.grade === null) {
                                pendingGrading++;
                            }
                            recentSubmissions.push({
                                type: 'submission',
                                courseTitle: course.title,
                                assignmentTitle: assignment.title,
                                studentId: sub.studentId,
                                submittedAt: sub.submittedAt
                            });
                        });
                    }
                });
            }
        });

        // Average Rating
        const ratings = allStudents
            .map((s: any) => s.Enrollment.rating)
            .filter((r: number) => r); // Filter out null/undefined

        const avgRating = ratings.length > 0
            ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
            : 0;

        // 3. Recent Activity (Enrollments + Submissions)
        const recentEnrollments = allStudents.map((s: any) => ({
            type: 'enrollment',
            courseTitle: courses.find(c => c.students?.some((st: any) => st.id === s.id))?.title,
            studentName: s.name,
            createdAt: s.Enrollment.joinedAt
        }));

        // We need to fetch student names for submissions efficiently
        // For now, let's just return what we have or do a separate fetch if critical.
        // Or better, include student in the submission include.
        // Optimized approach:
        // Actually, let's simplify. The loop above is synchronous.
        // Let's rely on frontend to display generic "Student" or fetch names if needed for feeds.
        // Actually for a proper feed "John Doe submitted...", we need the name.

        // Re-fetching specific submission details to get student names might be cleaner
        // but let's try to map it from known students if possible.
        // Ideally, we should include Student model in the Assignment->Submission include.

        const activityFeed = [...recentEnrollments, ...recentSubmissions]
            .sort((a, b) => new Date(b.createdAt || b.submittedAt).getTime() - new Date(a.createdAt || a.submittedAt).getTime())
            .slice(0, 10)
            .map((item: any) => {
                // Try to resolve student name for submissions from the allStudents list if possible
                let studentName = item.studentName || 'Student';
                if (item.type === 'submission') {
                    const student = allStudents.find((s: any) => s.id === item.studentId);
                    if (student) studentName = student.name;
                }
                return { ...item, studentName };
            });


        // 4. Enrollment Analytics (Last 7 days)
        const last7Days: any = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days[dateStr] = 0;
        }

        allStudents.forEach((student: any) => {
            const dateStr = new Date(student.Enrollment.joinedAt).toISOString().split('T')[0];
            if (last7Days[dateStr] !== undefined) {
                last7Days[dateStr]++;
            }
        });

        const chartData = Object.keys(last7Days).map(date => ({
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            date,
            students: last7Days[date]
        }));

        res.json({
            totalStudents,
            totalCourses,
            pendingGrading,
            avgRating,
            activityFeed,
            chartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch instructor stats' });
    }
};
