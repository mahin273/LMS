
import sequelize from '../config/database';
import { User, Course, Lesson, Enrollment, LessonProgress, Badge, Assignment, Submission } from '../models';
import bcrypt from 'bcrypt';

const firstNames = [
    'Md', 'Abdul', 'Rahim', 'Karim', 'Fahim', 'Mahmud', 'Sultana', 'Fatima', 'Ayesha',
    'Nusrat', 'Tanvir', 'Sakib', 'Rafiq', 'Jabbar', 'Hassan', 'Hussain', 'Tareq', 'Zia',
    'Kamal', 'Jamal', 'Nasreen', 'Rina', 'Shilpa', 'Tasnim', 'Farhana', 'Rubina'
];

const lastNames = [
    'Khan', 'Rahman', 'Alam', 'Islam', 'Ahmed', 'Hossain', 'Chowdhury', 'Sarkar', 'Uddin',
    'Haque', 'Mia', 'Bhuiyan', 'Sikder', 'Talukder', 'Majumdar', 'Ali', 'Sheikh', 'Gazi'
];

const courseTitles = [
    'Introduction to React', 'Advanced Node.js', 'Database Design 101', 'UI/UX Principles',
    'Python for Data Science', 'Machine Learning Basics', 'Cloud Computing with AWS',
    'Cybersecurity Fundamentals', 'Mobile App Dev with Flutter', 'DevOps Practices',
    'Algorithm Design', 'Data Structures', 'Web Security', 'Agile Methodologies',
    'Digital Marketing', 'Business Analytics', 'Project Management', 'Software Architecture'
];

const lessonContents = [
    '# Introduction\nWelcome to this lesson. Here we will learn the basics.',
    '# Deep Dive\nLet\'s explore the core concepts in detail.',
    '# Practice\nTime to apply what you have learned.',
    '# Advanced Topics\nTouching on more complex scenarios.',
    '# Summary\nRecapping everything we covered.'
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // await sequelize.sync({ force: true }); 

        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Admin
        await User.findOrCreate({
            where: { email: 'admin@lms.com' },
            defaults: {
                name: 'Admin User',
                email: 'admin@lms.com',
                password_hash: passwordHash,
                role: 'admin',
                status: 'active'
            }
        });

        // 2. Instructor (Main)
        const [instructor] = await User.findOrCreate({
            where: { email: 'instructor@lms.com' },
            defaults: {
                name: 'John Instructor',
                email: 'instructor@lms.com',
                password_hash: passwordHash,
                role: 'instructor',
                status: 'active'
            }
        });

        // 3. Student (Main)
        await User.findOrCreate({
            where: { email: 'student@lms.com' },
            defaults: {
                name: 'Jane Student',
                email: 'student@lms.com',
                password_hash: passwordHash,
                role: 'student',
                status: 'active'
            }
        });

        // 4. Bulk Instructors
        const instructors: User[] = [instructor];
        for (let i = 0; i < 20; i++) {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            const email = `instructor.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@lms.com`;
            if (email === 'instructor@lms.com') continue;

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
            } catch (e) { }
        }

        // 5. Bulk Students
        const students: User[] = [];
        const studentsData = Array.from({ length: 80 }).map((_, i) => {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            return {
                name: `${fName} ${lName}`,
                email: `student.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@lms.com`,
                password_hash: passwordHash,
                role: 'student' as const,
                status: 'active' as const
            };
        });

        // Using findOrCreate loop instead of bulkCreate to safely handle existing users and get instances
        for (const sData of studentsData) {
            try {
                const [s] = await User.findOrCreate({
                    where: { email: sData.email },
                    defaults: sData
                });
                students.push(s);
            } catch (e) { }
        }

        // 6. Courses & Lessons
        const allCourses: Course[] = [];
        for (const inst of instructors) {
            const numCourses = getRandomInt(1, 3);
            for (let j = 0; j < numCourses; j++) {
                const title = `${getRandomElement(courseTitles)} - ${100 + j}`;
                try {
                    const [course] = await Course.findOrCreate({
                        where: { title, instructorId: inst.id },
                        defaults: {
                            title,
                            description: `Course by ${inst.name}`,
                            instructorId: inst.id,
                            status: 'published'
                        }
                    });
                    allCourses.push(course);

                    // Lessons
                    const numLessons = getRandomInt(3, 5);
                    const existingLessons = await Lesson.count({ where: { courseId: course.id } });
                    if (existingLessons === 0) {
                        for (let k = 0; k < numLessons; k++) {
                            await Lesson.create({
                                courseId: course.id,
                                title: `Lesson ${k + 1}`,
                                content: getRandomElement(lessonContents),
                                orderIndex: k
                            });
                        }
                    }

                } catch (e) { }
            }
        }

        console.log('Seed completed successfully');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
