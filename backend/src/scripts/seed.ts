
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

        // Optional: Sync to ensure tables exist (use with caution in prod)
        // await sequelize.sync({ force: true }); // UNCOMMENT only if you want a clean slate

        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Admin
        const adminEmail = 'md.mahin.bd18@gmail.com';
        const [admin] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                name: 'Mahin',
                email: adminEmail,
                password_hash: passwordHash,
                role: 'admin'
            }
        });
        console.log('Admin check complete.');

        // 2. Instructors (20)
        const instructors: User[] = [];
        console.log('Seeding Instructors...');
        for (let i = 0; i < 20; i++) {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            const name = `${fName} ${lName}`;
            const email = `instructor.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@lms.com`;

            try {
                const [user] = await User.findOrCreate({
                    where: { email },
                    defaults: { name, email, password_hash: passwordHash, role: 'instructor' }
                });
                instructors.push(user);
            } catch (e) {
                console.log(`Skipped duplicate instructor: ${email}`);
            }
        }

        // 3. Students (80)
        const students: User[] = [];
        console.log('Seeding Students...');
        for (let i = 0; i < 80; i++) {
            const fName = getRandomElement(firstNames);
            const lName = getRandomElement(lastNames);
            const name = `${fName} ${lName}`;
            const email = `student.${fName.toLowerCase()}.${lName.toLowerCase()}${i}@lms.com`;

            try {
                const [user] = await User.findOrCreate({
                    where: { email },
                    defaults: { name, email, password_hash: passwordHash, role: 'student' }
                });
                students.push(user);
            } catch (e) {
                console.log(`Skipped duplicate student: ${email}`);
            }
        }

        // 4. Courses & Lessons
        console.log('Seeding Courses & Lessons...');
        const allCourses: Course[] = [];
        for (const instructor of instructors) {
            // Each instructor creates 1-3 courses
            const numCourses = getRandomInt(1, 3);
            for (let j = 0; j < numCourses; j++) {
                const title = `${getRandomElement(courseTitles)} - ${100 + j}`;
                try {
                    const course = await Course.create({
                        title: title,
                        description: `A comprehensive course about ${title}. Learn from expert ${instructor.name}.`,
                        instructorId: instructor.id
                    });
                    allCourses.push(course);

                    // Add 3-5 lessons per course
                    const numLessons = getRandomInt(3, 5);
                    for (let k = 0; k < numLessons; k++) {
                        await Lesson.create({
                            courseId: course.id,
                            title: `Lesson ${k + 1}: ${getRandomElement(['Basics', 'Fundamentals', 'Deep Dive', 'Case Study'])}`,
                            content: getRandomElement(lessonContents),
                            orderIndex: k
                        });
                    }

                    // Add 1 Assignment
                    if (Math.random() > 0.5) {
                        await Assignment.create({
                            courseId: course.id,
                            title: `Final Project for ${title}`,
                            description: 'Submit your complete project repository link here.',
                            dueDate: new Date(Date.now() + 86400000 * 7) // +7 days
                        });
                    }

                } catch (e) {
                    // ignore duplicate titles if any
                }
            }
        }

        // 5. Enrollments & Progress
        console.log('Seeding Enrollments & Progress...');
        for (const student of students) {
            // Enroll in 2-4 Random Courses
            const enrolledCount = getRandomInt(2, 4);
            const shuffledCourses = [...allCourses].sort(() => 0.5 - Math.random());
            const selectedCourses = shuffledCourses.slice(0, enrolledCount);

            for (const course of selectedCourses) {
                try {
                    await Enrollment.create({
                        studentId: student.id,
                        courseId: course.id,
                        status: 'active',
                        joinedAt: new Date()
                    });

                    // Simulate random progress (complete some lessons)
                    const lessons = await Lesson.findAll({ where: { courseId: course.id } });
                    const completedCount = getRandomInt(0, lessons.length);

                    for (let m = 0; m < completedCount; m++) {
                        await LessonProgress.create({
                            studentId: student.id,
                            lessonId: lessons[m].id,
                            completedAt: new Date()
                        });
                    }

                    // Award Badge if completed enough? (Simulated)
                    if (completedCount >= 1 && Math.random() > 0.7) {
                        await Badge.create({
                            studentId: student.id,
                            courseId: course.id,
                            type: getRandomElement(['BRONZE', 'SILVER', 'GOLD']) as 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER',
                            awardedAt: new Date()
                        });
                    }

                } catch (e) {
                    // Ignore duplicate enrollment
                }
            }
        }

        console.log('Full Database Seeding Complete! 🚀');
        console.log(`- Instructors: ${instructors.length}`);
        console.log(`- Students: ${students.length}`);
        console.log(`- Courses: ${allCourses.length}`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
