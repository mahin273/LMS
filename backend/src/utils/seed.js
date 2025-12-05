require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Course, Lesson, Assignment, Enrollment, Progress } = require('../models');

// Bangladeshi names
const firstNames = [
    'Rahman', 'Karim', 'Hasan', 'Ahmed', 'Khan', 'Islam', 'Ali', 'Mahmud', 'Rahim', 'Hossain',
    'Rashid', 'Khalid', 'Farhan', 'Imran', 'Fahim', 'Sakib', 'Tamim', 'Mushfiq', 'Mashrafe', 'Shakib',
    'Rafiq', 'Shafiq', 'Tarek', 'Samir', 'Nasir', 'Jubair', 'Habib', 'Kamrul', 'Mizanur', 'Aminul',
    'Fatema', 'Ayesha', 'Nusrat', 'Tahmina', 'Sultana', 'Yasmin', 'Ruksana', 'Farhana', 'Sharmin', 'Sabrina',
    'Nasrin', 'Rahima', 'Salma', 'Amina', 'Shirin', 'Rehana', 'Shahnaz', 'Fouzia', 'Parvin', 'Hasina'
];

const lastNames = [
    'Rahman', 'Ahmed', 'Khan', 'Islam', 'Hossain', 'Ali', 'Mahmud', 'Alam', 'Karim', 'Uddin',
    'Chowdhury', 'Mia', 'Bepari', 'Sarkar', 'Das', 'Roy', 'Bhattacharya', 'Siddique', 'Talukder', 'Mondal',
    'Sheikh', 'Haque', 'Bhuiyan', 'Begum', 'Khatun', 'Akter', 'Akther', 'Parvin', 'Sultana', 'Jahan'
];

const courseTitles = [
    'Web Development Fundamentals', 'Advanced JavaScript', 'Python Programming', 'Data Science with Python',
    'Machine Learning Basics', 'Digital Marketing', 'Graphic Design', 'UI/UX Design', 'Mobile App Development',
    'Backend Development with Node.js', 'React.js Complete Guide', 'Database Management', 'Cybersecurity Essentials',
    'Cloud Computing with AWS', 'Business Analytics', 'English Communication', 'Project Management', 'Accounting Basics'
];

const categories = ['Web Development', 'Programming', 'Data Science', 'Design', 'Business', 'Marketing', 'Language'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Lesson.deleteMany({}),
            Assignment.deleteMany({}),
            Enrollment.deleteMany({}),
            Progress.deleteMany({}),
        ]);
        console.log('✓ Cleared existing data');

        const password = 'Pass123!'; // Plain password - User model will hash it via pre-save hook
        const users = [];

        // Create admin
        const admin = await User.create({
            email: 'admin@lms.com',
            password,
            name: 'System Admin',
            role: 'admin',
            isApproved: true,
        });
        users.push(admin);
        console.log('✓ Created admin: admin@lms.com / Pass123!');

        // Create 30 instructors (all approved)
        console.log('Creating 30 instructors...');
        for (let i = 0; i < 30; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@instructor.com`;

            const instructor = await User.create({
                email,
                password,
                name,
                role: 'instructor',
                isApproved: true,
            });
            users.push(instructor);
        }
        console.log('✓ Created 30 instructors');

        // Create 5 pending instructors
        console.log('Creating 5 pending instructors...');
        for (let i = 0; i < 5; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `pending.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@instructor.com`;

            await User.create({
                email,
                password,
                name,
                role: 'instructor',
                isApproved: false,
            });
        }
        console.log('✓ Created 5 pending instructors');

        // Create 65 students
        console.log('Creating 65 students...');
        for (let i = 0; i < 65; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.com`;

            const student = await User.create({
                email,
                password,
                name,
                role: 'student',
                isApproved: true,
            });
            users.push(student);
        }
        console.log('✓ Created 65 students');
        console.log(`✅ Total users created: 101 (1 admin + 30 instructors + 5 pending + 65 students)`);

        // Get approved instructors
        const instructors = users.filter(u => u.role === 'instructor' && u.isApproved);
        const students = users.filter(u => u.role === 'student');

        // Create 18 courses
        console.log('\nCreating 18 courses...');
        const courses = [];
        for (let i = 0; i < 18; i++) {
            const instructor = instructors[Math.floor(Math.random() * instructors.length)];
            const course = await Course.create({
                title: courseTitles[i],
                description: `A comprehensive ${courseTitles[i]} course covering all essential topics and practical applications.`,
                instructor: instructor._id,
                status: i < 15 ? 'published' : 'draft',
                category: categories[Math.floor(Math.random() * categories.length)],
                difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            });
            courses.push(course);

            // Create 4-8 lessons for each course
            const lessonCount = 4 + Math.floor(Math.random() * 5);
            for (let j = 0; j < lessonCount; j++) {
                await Lesson.create({
                    courseId: course._id,
                    title: `Lesson ${j + 1}: ${courseTitles[i]} - Part ${j + 1}`,
                    contentType: j % 3 === 0 ? 'video' : 'text',
                    content: j % 3 === 0 ? 'https://youtube.com/example' : `<h1>Lesson ${j + 1}</h1><p>Course content goes here.</p>`,
                    order: j + 1,
                    duration: 15 + Math.floor(Math.random() * 30),
                });
            }

            // Create 1-2 assignments
            const assignmentCount = 1 + Math.floor(Math.random() * 2);
            for (let k = 0; k < assignmentCount; k++) {
                await Assignment.create({
                    courseId: course._id,
                    title: `Assignment ${k + 1}: ${courseTitles[i]}`,
                    description: `Complete the practical exercises for ${courseTitles[i]}. Submit your work as a PDF or code file.`,
                    dueDate: new Date(Date.now() + (7 + Math.floor(Math.random() * 21)) * 24 * 60 * 60 * 1000),
                    maxScore: 100,
                });
            }
        }
        console.log('✓ Created 18 courses with lessons and assignments');

        // Create enrollments (each student enrolls in 2-5 random courses)
        console.log('\nCreating enrollments and progress...');
        let enrollmentCount = 0;
        for (const student of students) {
            const enrollmentNum = 2 + Math.floor(Math.random() * 4); // 2-5 courses
            const shuffled = courses.filter(c => c.status === 'published').sort(() => 0.5 - Math.random());
            const enrolledCourses = shuffled.slice(0, Math.min(enrollmentNum, shuffled.length));

            for (const course of enrolledCourses) {
                await Enrollment.create({
                    userId: student._id,
                    courseId: course._id,
                });

                // Create random progress (0-100%)
                const percentage = Math.floor(Math.random() * 101);
                const lessons = await Lesson.find({ courseId: course._id });
                const completedCount = Math.floor((lessons.length * percentage) / 100);
                const completedLessons = lessons.slice(0, completedCount).map(l => l._id);

                await Progress.create({
                    userId: student._id,
                    courseId: course._id,
                    completedLessons,
                    percentage,
                    lastAccessedLesson: completedLessons.length > 0 ? completedLessons[completedLessons.length - 1] : null,
                    lastAccessedAt: new Date(),
                    completedAt: percentage === 100 ? new Date() : null,
                });

                enrollmentCount++;
            }
        }
        console.log(`✓ Created ${enrollmentCount} enrollments with progress tracking`);

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📧 Test Login:');
        console.log('Admin: admin@lms.com / Pass123!');
        console.log('Instructors: [firstname].[lastname][0-29]@instructor.com / Pass123!');
        console.log('Students: [firstname].[lastname][0-64]@student.com / Pass123!');
        console.log('\n📊 Summary:');
        console.log('• 101 total users (1 admin, 30 instructors, 5 pending, 65 students)');
        console.log('• 18 courses (15 published, 3 draft)');
        console.log(`• ${enrollmentCount} enrollments with progress data`);
        console.log('• Multiple lessons and assignments per course');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

connectDB().then(seedData);
