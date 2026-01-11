import sequelize from '../config/database';
import { User, Course, Lesson, Enrollment, LessonProgress, Badge, Assignment, Submission } from '../models';
import bcrypt from 'bcrypt';

const firstNames = [
    'Md', 'Abdul', 'Rahim', 'Karim', 'Fahim', 'Mahmud', 'Sultana', 'Fatima', 'Ayesha',
    'Nusrat', 'Tanvir', 'Sakib', 'Rafiq', 'Jabbar', 'Hassan', 'Hussain', 'Tareq', 'Zia',
    'Kamal', 'Jamal', 'Nasreen', 'Rina', 'Shilpa', 'Tasnim', 'Farhana', 'Rubina',
    'Arif', 'Basir', 'Jashim', 'Mokles', 'Salma', 'Jahanara', 'Bilquis', 'Rokeya',
    'Anwar', 'Babar', 'Daud', 'Elias', 'Firoz', 'Gias', 'Habib', 'Idris'
];

const lastNames = [
    'Khan', 'Rahman', 'Alam', 'Islam', 'Ahmed', 'Hossain', 'Chowdhury', 'Sarkar', 'Uddin',
    'Haque', 'Mia', 'Bhuiyan', 'Sikder', 'Talukder', 'Majumdar', 'Ali', 'Sheikh', 'Gazi',
    'Munshi', 'Dewan', 'Khandaker', 'Patwary', 'Mridha', 'Akond', 'Bepari', 'Howlader'
];

const courseTitles = [
    'Introduction to React', 'Advanced Node.js', 'Database Design 101', 'UI/UX Principles',
    'Python for Data Science', 'Machine Learning Basics', 'Cloud Computing with AWS',
    'Cybersecurity Fundamentals', 'Mobile App Dev with Flutter', 'DevOps Practices',
    'Algorithm Design', 'Data Structures', 'Web Security', 'Agile Methodologies',
    'Digital Marketing', 'Business Analytics', 'Project Management', 'Software Architecture',
    'Blockchain Basics', 'IoT Fundamentals', 'Game Development with Unity', 'Ethical Hacking'
];

const lessonContents = [
    '# Introduction\nWelcome to this lesson. Here we will learn the basics.',
    '# Deep Dive\nLet\'s explore the core concepts in detail.',
    '# Practice\nTime to apply what you have learned.',
    '# Advanced Topics\nTouching on more complex scenarios.',
    '# Summary\nRecapping everything we covered.'
];

// Badge types from model
const badgeTypes = ['BRONZE', 'SILVER', 'GOLD', 'MASTER'] as const;

// Helper to get typed element
const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const seedDatabase = async (forceRewrite = false) => {
    try {
        console.log('Connecting to database...');
        // Ensure connection if not already connected (though usually called in context where it is)
        // await sequelize.authenticate(); 

        if (forceRewrite) {
            await sequelize.sync({ force: true });
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Ensure Admin
        await User.findOrCreate({
            where: { email: 'md.mahin.bd18@gmail.com' },
            defaults: {
                name: 'Mahin Admin',
                email: 'md.mahin.bd18@gmail.com',
                password_hash: passwordHash,
                role: 'admin',
                status: 'active'
            }
        });

        // 2. Instructors (Target: 50)
        console.log('Seeding Instructors...');
        const instructors: User[] = [];
        for (let i = 0; i < 50; i++) {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            const email = `instructor.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`;

            try {
                const [inst] = await User.findOrCreate({
                    where: { email },
                    defaults: {
                        name: `${fName} ${lName}`,
                        email,
                        password_hash: passwordHash,
                        role: 'instructor',
                        status: 'active'
                    }
                });
                instructors.push(inst);
            } catch (e) {
                // Ignore duplicates or errors
            }
        }

        // 3. Students (Target: 150)
        console.log('Seeding Students...');
        const students: User[] = [];
        for (let i = 0; i < 150; i++) {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            const email = `student.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`;

            try {
                const [stu] = await User.findOrCreate({
                    where: { email },
                    defaults: {
                        name: `${fName} ${lName}`,
                        email,
                        password_hash: passwordHash,
                        role: 'student',
                        status: 'active'
                    }
                });
                students.push(stu);
            } catch (e) { }
        }

        // 4. Courses, Lessons, Enrollments, etc.
        console.log('Seeding Courses and dependent data...');
        // Only processing if we have instructors and students
        if (instructors.length === 0 || students.length === 0) {
            console.log('Not enough users to seed courses/enrollments.');
            return;
        }

        for (const inst of instructors) {
            // Each instructor creates 1-3 courses
            const numCourses = getRandomInt(1, 3);
            for (let j = 0; j < numCourses; j++) {
                const titleBase = getRandomElement(courseTitles);
                const title = `${titleBase} - ${inst.name.split(' ')[0]}-${j}`; // Make unique-ish

                try {
                    const [course] = await Course.findOrCreate({
                        where: { title, instructorId: inst.id },
                        defaults: {
                            title,
                            description: `A comprehensive course on ${titleBase} taught by ${inst.name}.`,
                            instructorId: inst.id,
                            status: 'published'
                        }
                    });

                    // Create Lessons for the course
                    const existingLessons = await Lesson.count({ where: { courseId: course.id } });
                    const lessons: Lesson[] = [];
                    if (existingLessons === 0) {
                        const numLessons = getRandomInt(5, 10);
                        for (let k = 0; k < numLessons; k++) {
                            const lesson = await Lesson.create({
                                courseId: course.id,
                                title: `Lesson ${k + 1}: ${getRandomElement(['Basics', 'Fundamentals', 'Deep Dive', 'Case Study', 'Review'])}`,
                                content: getRandomElement(lessonContents),
                                orderIndex: k
                            });
                            lessons.push(lesson);
                        }
                    } else {
                        const dbLessons = await Lesson.findAll({ where: { courseId: course.id } });
                        lessons.push(...dbLessons);
                    }

                    // Create Assignments 
                    const existingAssignments = await Assignment.count({ where: { courseId: course.id } });
                    const assignments: Assignment[] = [];
                    if (existingAssignments === 0) {
                        const numAssignments = getRandomInt(1, 3);
                        for (let k = 0; k < numAssignments; k++) {
                            const assignment = await Assignment.create({
                                courseId: course.id,
                                title: `Assignment ${k + 1}`,
                                description: 'Please complete this assignment by the due date.',
                                dueDate: getRandomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)))
                            });
                            assignments.push(assignment);
                        }
                    } else {
                        const dbAssignments = await Assignment.findAll({ where: { courseId: course.id } });
                        assignments.push(...dbAssignments);
                    }

                    // Enroll random students
                    const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
                    const selectedStudents = shuffledStudents.slice(0, getRandomInt(10, 30));

                    for (const student of selectedStudents) {
                        try {
                            const [enrollment] = await Enrollment.findOrCreate({
                                where: { studentId: student.id, courseId: course.id },
                                defaults: {
                                    studentId: student.id,
                                    courseId: course.id,
                                    status: 'active',
                                    joinedAt: new Date()
                                }
                            });

                            // Generate Lesson Progress
                            if (lessons.length > 0) {
                                // Mark some lessons as completed
                                const completedCount = getRandomInt(0, lessons.length);
                                for (let l = 0; l < completedCount; l++) {
                                    await LessonProgress.findOrCreate({
                                        where: { studentId: student.id, lessonId: lessons[l].id },
                                        defaults: {
                                            studentId: student.id,
                                            lessonId: lessons[l].id,
                                            completedAt: new Date()
                                        }
                                    });
                                }
                            }

                            // Generate Submissions for Assignments
                            for (const assignment of assignments) {
                                // 70% chance to submit
                                if (Math.random() > 0.3) {
                                    await Submission.findOrCreate({
                                        where: { studentId: student.id, assignmentId: assignment.id },
                                        defaults: {
                                            studentId: student.id,
                                            assignmentId: assignment.id,
                                            fileUrl: 'https://github.com/example/project',
                                            grade: Math.random() > 0.5 ? getRandomInt(70, 100) : undefined,
                                            feedback: Math.random() > 0.5 ? 'Great job!' : undefined
                                        }
                                    });
                                }
                            }

                            // Award Badges (Randomly)
                            if (Math.random() > 0.8) {
                                const type = getRandomElement(badgeTypes);
                                await Badge.create({
                                    studentId: student.id,
                                    courseId: course.id,
                                    type: type,
                                    awardedAt: new Date()
                                });
                            }

                        } catch (e) {
                            // console.error(e); 
                        }
                    }

                } catch (e) { console.error('Error creating course:', e); }
            }
        }

        console.log('Seed completed successfully');

    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};
