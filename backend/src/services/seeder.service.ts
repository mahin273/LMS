import sequelize from '../config/database';
import { User, Course, Lesson, Enrollment, LessonProgress, Badge, Assignment, Submission } from '../models';
import bcrypt from 'bcrypt';
// import { faker } from '@faker-js/faker'; // Using faker if available, otherwise manual arrays

// Since I don't know if faker is installed, I will use extensive manual arrays to be safe and robust.

const bdFirstNames = [
    'Md', 'Abdul', 'Rahim', 'Karim', 'Fahim', 'Mahmud', 'Sultan', 'Hassan', 'Hussain', 'Tareq', 'Zia',
    'Kamal', 'Jamal', 'Arif', 'Basir', 'Jashim', 'Mokles', 'Anwar', 'Babar', 'Daud', 'Elias', 'Firoz',
    'Gias', 'Habib', 'Idris', 'Jalal', 'Kabir', 'Latif', 'Manzur', 'Nasir', 'Osman', 'Parvez', 'Quazem',
    'Rafiq', 'Salam', 'Tofazzal', 'Umar', 'Wadud', 'Yusuf', 'Zahid',
    'Fatima', 'Ayesha', 'Nusrat', 'Nasreen', 'Rina', 'Shilpa', 'Tasnim', 'Farhana', 'Rubina', 'Salma',
    'Jahanara', 'Bilquis', 'Rokeya', 'Shamsun', 'Meher', 'Khadija', 'Zainab', 'Mariam', 'Yasmin', 'Sabina'
];

const bdLastNames = [
    'Khan', 'Rahman', 'Alam', 'Islam', 'Ahmed', 'Hossain', 'Chowdhury', 'Sarkar', 'Uddin', 'Haque',
    'Mia', 'Bhuiyan', 'Sikder', 'Talukder', 'Majumdar', 'Ali', 'Sheikh', 'Gazi', 'Munshi', 'Dewan',
    'Khandaker', 'Patwary', 'Mridha', 'Akond', 'Bepari', 'Howlader', 'Matubbar', 'Laskar', 'Mollah',
    'Mondal', 'Pramanik', 'Pal', 'Das', 'Sen', 'Dutta', 'Ghosh', 'Chakraborty', 'Banerjee', 'Biswas'
];

const courseTopics = [
    'Web Development', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Cyber Security',
    'Cloud Computing', 'DevOps', 'Blockchain', 'Internet of Things', 'Mobile App Development',
    'Game Development', 'Digital Marketing', 'Graphics Design', 'UI/UX Design', 'Video Editing',
    'Content Writing', 'SEO Optimization', 'Business Intelligence', 'Project Management', 'Agile Scrum'
];

const techStacks = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git',
    'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'Rest API', 'Flutter', 'React Native'
];

const lessonTypes = ['Introduction', 'Core Concept', 'Advanced Techniques', 'Hands-on Lab', 'Case Study', 'Project Work', 'Final Review'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const seedDatabase = async (forceRewrite = true) => {
    try {
        console.log('Starting comprehensive database seed...');

        if (forceRewrite) {
            console.log('Force syncing database (clearing all data)...');
            await sequelize.sync({ force: true });
            console.log('Database cleared and synced.');
        }

        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Create Admin
        console.log('Creating Admin...');
        await User.create({
            name: 'Mahin Admin',
            email: 'md.mahin.bd18@gmail.com',
            password_hash: passwordHash,
            role: 'admin',
            status: 'active'
        });

        // 2. Create Instructors (50)
        console.log('Creating 50 Instructors...');
        const instructors: User[] = [];
        for (let i = 1; i <= 50; i++) {
            const fName = getRandomElement(bdFirstNames);
            const lName = getRandomElement(bdLastNames);

            // Ensure unique email by appending index
            const email = `instructor.${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@lms.com`;

            const instructor = await User.create({
                name: `${fName} ${lName}`,
                email: email,
                password_hash: passwordHash,
                role: 'instructor',
                status: 'active'
            });
            instructors.push(instructor);
        }

        // 3. Create Students (200)
        console.log('Creating 200 Students...');
        const students: User[] = [];
        for (let i = 1; i <= 200; i++) {
            const fName = getRandomElement(bdFirstNames);
            const lName = getRandomElement(bdLastNames);
            const email = `student.${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@lms.com`;

            const student = await User.create({
                name: `${fName} ${lName}`,
                email: email,
                password_hash: passwordHash,
                role: 'student',
                status: 'active'
            });
            students.push(student);
        }

        // 4. Create Courses
        console.log('Creating Courses...');
        const courses: Course[] = [];
        for (const instructor of instructors) {
            // Each instructor creates 1-2 courses
            const numCourses = getRandomInt(1, 2);
            for (let j = 0; j < numCourses; j++) {
                const topic = getRandomElement(courseTopics);
                const stack = getRandomElement(techStacks);
                const title = `Mastering ${topic} with ${stack} - ${j + 1}`;

                const course = await Course.create({
                    title: title,
                    description: `A complete guide to ${topic} using market-leading technology ${stack}. Designed for beginners and professionals.`,
                    instructorId: instructor.id,
                    status: 'published'
                });
                courses.push(course);

                // 5. Create Lessons for this Course
                const numLessons = getRandomInt(5, 12);
                const courseLessons: Lesson[] = [];
                for (let k = 0; k < numLessons; k++) {
                    const lesson = await Lesson.create({
                        courseId: course.id,
                        title: `${lessonTypes[k % lessonTypes.length]}: Part ${Math.floor(k / lessonTypes.length) + 1}`,
                        content: `## ${title}\n\nIn this lesson, we cover essential concepts of ${stack}.\n\n### Key Takeaways\n- Concept 1\n- Concept 2\n- Practical Application`,
                        orderIndex: k
                    });
                    courseLessons.push(lesson);
                }

                // 6. Create Assignments
                const numAssignments = getRandomInt(2, 4);
                const courseAssignments: Assignment[] = [];
                for (let a = 0; a < numAssignments; a++) {
                    const assignment = await Assignment.create({
                        courseId: course.id,
                        title: `${stack} Project ${a + 1}`,
                        description: `Build a small application using ${stack} based on the lessons covered so far.`,
                        dueDate: getRandomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 3)))
                    });
                    courseAssignments.push(assignment);
                }

                // 7. Enroll Random Students
                // 10-40 students per course
                const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
                const enrolledCount = getRandomInt(10, 40);
                const courseStudents = shuffledStudents.slice(0, enrolledCount);

                for (const student of courseStudents) {
                    await Enrollment.create({
                        studentId: student.id,
                        courseId: course.id,
                        status: 'active',
                        joinedAt: getRandomDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date())
                    });

                    // 8. Generate Progress (Student completes 0-100% of lessons)
                    const lessonsCompletedCount = getRandomInt(0, courseLessons.length);
                    for (let l = 0; l < lessonsCompletedCount; l++) {
                        await LessonProgress.create({
                            studentId: student.id,
                            lessonId: courseLessons[l].id,
                            completedAt: new Date()
                        });
                    }

                    // 9. Generate Submissions
                    for (const assign of courseAssignments) {
                        if (Math.random() > 0.4) { // 60% submission rate
                            await Submission.create({
                                studentId: student.id,
                                assignmentId: assign.id,
                                fileUrl: `https://github.com/${student.name.replace(' ', '')}/assignment-${assign.id}`,
                                grade: Math.random() > 0.2 ? getRandomInt(60, 100) : undefined, // 80% graded
                                feedback: 'Good effort, keep it up!'
                            });
                        }
                    }

                    // 10. Award Badges based on progress milestones
                    const progressPercent = (lessonsCompletedCount / courseLessons.length) * 100;
                    
                    const milestones = [
                        { type: 'BRONZE', threshold: 25 },
                        { type: 'SILVER', threshold: 50 },
                        { type: 'GOLD', threshold: 90 },
                        { type: 'MASTER', threshold: 100 },
                    ];

                    for (const milestone of milestones) {
                        if (progressPercent >= milestone.threshold) {
                            await Badge.create({
                                studentId: student.id,
                                courseId: course.id,
                                type: milestone.type as any,
                                awardedAt: new Date()
                            });
                        }
                    }

                    // 11. Update enrollment status if completed
                    if (progressPercent === 100) {
                        await Enrollment.update(
                            { status: 'completed' },
                            { where: { studentId: student.id, courseId: course.id } }
                        );
                    }
                }
            }
        }

        console.log('Seeding completed successfully!');
        console.log(`Created: 1 Admin, ${instructors.length} Instructors, ${students.length} Students, ${courses.length} Courses.`);

    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};
