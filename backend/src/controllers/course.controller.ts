import { Request, Response } from 'express';
import { Course, Enrollment, User, Badge, Lesson, LessonProgress, Assignment, Submission } from '../models';


export const getPublicCourses = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const offset = (page - 1) * limit;
        const search = req.query.search as string || '';

        const whereClause: any = { status: 'published' };
        if (search) {
            whereClause.title = { [require('sequelize').Op.like]: `%${search}%` };
        }

        const { count, rows: courses } = await Course.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'instructor', attributes: ['name'] },
                {
                    model: User,
                    as: 'students',
                    attributes: ['id'],
                    through: { attributes: ['rating'] }
                }
            ],
            limit,
            offset,
            distinct: true
        });

        // Calculate stats manually for now to avoid Group By complexify
        const coursesWithStats = courses.map((course: any) => {
            const enrollments = course.students || [];
            const studentCount = enrollments.length;

            const ratings = enrollments
                .map((s: any) => s.Enrollment?.rating)
                .filter((r: any) => r);

            const avg = ratings.length > 0
                ? (ratings.reduce((a: any, b: any) => a + b, 0) / ratings.length).toFixed(1)
                : null;

            return {
                ...course.toJSON(),
                studentCount,
                averageRating: avg ? parseFloat(avg) : null,
                students: undefined
            };
        });

        res.json({
            courses: coursesWithStats,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search as string || '';

        const whereClause: any = { instructorId };

        if (search) {
            whereClause.title = { [require('sequelize').Op.like]: `%${search}%` };
        }

        const { count, rows: courses } = await Course.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'students', attributes: ['id', 'name', 'email'] }
            ],
            distinct: true // Important for correct count with includes
        });

        res.json({
            courses,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ error: 'Failed to fetch instructor courses' });
    }
};

export const getAllCoursesAdmin = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search as string || '';
        const status = req.query.status as string || '';

        const whereClause: any = {};
        if (search) {
            whereClause.title = { [require('sequelize').Op.like]: `%${search}%` };
        }
        if (status) {
            whereClause.status = status;
        }

        const instructorId = req.query.instructorId as string;
        if (instructorId) {
            whereClause.instructorId = instructorId;
        }

        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        if (startDate && endDate) {
            whereClause.createdAt = {
                [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        if (minPrice !== undefined && maxPrice !== undefined) {
            whereClause.price = {
                [require('sequelize').Op.between]: [minPrice, maxPrice]
            };
        } else if (minPrice !== undefined) {
            whereClause.price = { [require('sequelize').Op.gte]: minPrice };
        } else if (maxPrice !== undefined) {
            whereClause.price = { [require('sequelize').Op.lte]: maxPrice };
        }

        const sortBy = req.query.sortBy as string;
        const sortOrder = (req.query.sortOrder as string) || 'DESC';

        console.log(`Instructor Fetch: ID=${instructorId} Page=${page} Limit=${limit} Offset=${offset}`);

        const { count, rows: courses } = await Course.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'instructor', attributes: ['name', 'email'] },
                { model: User, as: 'students', attributes: ['id'] }
            ],
            limit,
            offset,
            distinct: true,
            order: [[sortBy || 'createdAt', sortOrder || 'DESC']]
        });
        console.log(`Found ${count} courses. Returning ${courses.length} rows.`);

        res.json({
            courses,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all courses' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const course = await Course.findByPk(id, {
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'students', attributes: ['id', 'name', 'email', 'avatarUrl'] },
                { model: Lesson, as: 'lessons', attributes: ['id', 'title', 'orderIndex'] }
            ]
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Add calculated fields
        const courseData = course.toJSON();
        (courseData as any).studentCount = course.students?.length || 0;

        res.json(courseData);
    } catch (error) {
        console.error('Error fetching course by ID:', error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    const { title, description, price, thumbnail } = req.body;
    try {
        const course = await Course.create({
            instructorId: instructorId!,
            title,
            description,
            price: price || 0,
            thumbnail: thumbnail || null,
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
        // Instead of deleting, update status to 'dropped'
        const enrollment = await Enrollment.findOne({
            where: { studentId, courseId }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        enrollment.status = 'dropped';
        await enrollment.save();

        res.json({ message: 'Course dropped successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to drop course' });
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

        // Check if student has completed at least 50% of the course
        const totalLessons = await Lesson.count({ where: { courseId } });
        if (totalLessons > 0) {
            const lessonIds = (await Lesson.findAll({ where: { courseId }, attributes: ['id'] })).map(l => l.id);
            const completedCount = await LessonProgress.count({
                where: { studentId, lessonId: lessonIds }
            });
            const progressPercent = (completedCount / totalLessons) * 100;

            if (progressPercent < 50) {
                return res.status(400).json({
                    error: 'You must complete at least 50% of the course before rating',
                    currentProgress: Math.round(progressPercent)
                });
            }
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
        if (req.body.price !== undefined) course.price = req.body.price;
        if (req.body.thumbnail !== undefined) course.thumbnail = req.body.thumbnail;

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
    const { status, rejectionReason } = req.body; // 'published' | 'rejected'

    if (!['published', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        course.status = status;
        if (status === 'rejected' && rejectionReason) {
            course.rejectionReason = rejectionReason;
        } else if (status === 'published') {
            course.rejectionReason = null; // Clear rejection reason if published
        }

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

export const bulkCourseAction = async (req: Request, res: Response) => {
    const { courseIds, action } = req.body; // action: 'approve' | 'reject' | 'delete'
    const { rejectionReason } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ error: 'No courses selected' });
    }

    try {
        if (action === 'delete') {
            await Course.destroy({
                where: {
                    id: courseIds
                }
            });
            return res.json({ message: `Successfully deleted ${courseIds.length} courses` });
        }

        if (action === 'approve') {
            const [updateCount] = await Course.update({ status: 'published', rejectionReason: null }, {
                where: {
                    id: courseIds
                }
            });
            return res.json({ message: `Successfully approved ${courseIds.length} courses` });
        }

        if (action === 'reject') {
            await Course.update({
                status: 'rejected',
                rejectionReason: rejectionReason || 'Course rejected by admin'
            }, {
                where: {
                    id: courseIds
                }
            });
            return res.json({ message: `Successfully rejected ${courseIds.length} courses` });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ error: 'Failed to perform bulk action' });
    }
};

export const getInstructorStudents = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    try {
        const courses = await Course.findAll({
            where: { instructorId },
            include: [
                {
                    model: User,
                    as: 'students',
                    attributes: ['id', 'name', 'email', 'avatarUrl'],
                    through: { attributes: ['joinedAt', 'status'] }
                }
            ]
        });

        const studentsList: any[] = [];
        const seen = new Set<string>();

        courses.forEach((course) => {
            if (course.students) {
                course.students.forEach((student: any) => {
                    // specific unique key per student-course enrollment
                    const key = `${student.id}-${course.id}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        studentsList.push({
                            studentId: student.id,
                            studentName: student.name,
                            studentEmail: student.email,
                            studentAvatar: student.avatarUrl,
                            courseId: course.id,
                            courseTitle: course.title,
                            joinedAt: student.Enrollment.joinedAt,
                            status: student.Enrollment.status
                        });
                    }
                });
            }
        });

        res.json(studentsList);
    } catch (error) {
        console.error('Error fetching instructor students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const toggleStudentBan = async (req: Request, res: Response) => {
    const instructorId = (req as any).user?.id;
    const { courseId, studentId } = req.body;

    try {
        // 1. Verify Instructor owns the course
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructorId !== instructorId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // 2. Find Enrollment
        const enrollment = await Enrollment.findOne({
            where: { courseId, studentId }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Student not enrolled in this course' });
        }

        // 3. Toggle Status
        if (enrollment.status === 'banned') {
            enrollment.status = 'active'; // Unban
        } else {
            enrollment.status = 'banned'; // Ban
        }

        await enrollment.save();

        res.json({
            message: `Student ${enrollment.status === 'banned' ? 'banned' : 'unbanned'} successfully`,
            status: enrollment.status
        });

    } catch (error) {
        console.error('Error toggling ban status:', error);
        res.status(500).json({ error: 'Failed to update student status' });
    }
};
