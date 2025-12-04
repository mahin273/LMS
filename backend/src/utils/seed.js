require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Course, Lesson, Assignment } = require('../models');

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
        await Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Lesson.deleteMany({}),
            Assignment.deleteMany({}),
        ]);

        console.log('Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('Admin123!', 12);
        const admin = await User.create({
            email: 'admin@lms.com',
            password: adminPassword,
            name: 'System Administrator',
            role: 'admin',
            isApproved: true,
        });
        console.log('Created admin user: admin@lms.com / Admin123!');

        // Create instructor
        const instructorPassword = await bcrypt.hash('Instructor123!', 12);
        const instructor = await User.create({
            email: 'instructor@lms.com',
            password: instructorPassword,
            name: 'John Smith',
            role: 'instructor',
            isApproved: true,
        });
        console.log('Created instructor: instructor@lms.com / Instructor123!');

        // Create student
        const studentPassword = await bcrypt.hash('Student123!', 12);
        const student = await User.create({
            email: 'student@lms.com',
            password: studentPassword,
            name: 'Jane Doe',
            role: 'student',
            isApproved: true,
        });
        console.log('Created student: student@lms.com / Student123!');

        // Create pending instructor
        await User.create({
            email: 'pending@lms.com',
            password: await bcrypt.hash('Pending123!', 12),
            name: 'Pending Teacher',
            role: 'instructor',
            isApproved: false,
        });
        console.log('Created pending instructor: pending@lms.com / Pending123!');

        // Create courses
        const course1 = await Course.create({
            title: 'Introduction to Web Development',
            description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything you need to know to build modern websites from scratch.',
            instructor: instructor._id,
            status: 'published',
            category: 'Web Development',
            difficulty: 'beginner',
        });

        const course2 = await Course.create({
            title: 'Advanced JavaScript Patterns',
            description: 'Master advanced JavaScript concepts including closures, prototypes, async patterns, and design patterns used in modern applications.',
            instructor: instructor._id,
            status: 'published',
            category: 'Programming',
            difficulty: 'advanced',
        });

        const course3 = await Course.create({
            title: 'Node.js Backend Development',
            description: 'Build scalable backend applications with Node.js and Express. Learn about REST APIs, authentication, databases, and deployment.',
            instructor: instructor._id,
            status: 'draft',
            category: 'Backend',
            difficulty: 'intermediate',
        });

        console.log('Created 3 courses');

        // Create lessons for course 1
        const lessons = [
            { title: 'Welcome to Web Development', contentType: 'text', content: '<h1>Welcome!</h1><p>In this course, you will learn the foundations of web development.</p>', order: 1, duration: 5 },
            { title: 'Understanding HTML Basics', contentType: 'text', content: '<h1>HTML Basics</h1><p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>', order: 2, duration: 15 },
            { title: 'CSS Styling Fundamentals', contentType: 'text', content: '<h1>CSS Fundamentals</h1><p>CSS (Cascading Style Sheets) is used to style and layout web pages.</p>', order: 3, duration: 20 },
            { title: 'JavaScript Introduction', contentType: 'video', content: 'https://www.youtube.com/watch?v=example', order: 4, duration: 30 },
            { title: 'Building Your First Website', contentType: 'text', content: '<h1>Your First Website</h1><p>Now let\'s put everything together and build a complete website!</p>', order: 5, duration: 45 },
        ];

        for (const lesson of lessons) {
            await Lesson.create({ ...lesson, courseId: course1._id });
        }
        console.log('Created 5 lessons for Web Development course');

        // Create assignment
        await Assignment.create({
            courseId: course1._id,
            title: 'Build a Personal Portfolio',
            description: 'Create a personal portfolio website showcasing your skills. Use HTML for structure, CSS for styling, and optionally JavaScript for interactivity. Your portfolio should include: an about section, projects section, and contact information.',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        });
        console.log('Created assignment');

        console.log('\n✅ Seed completed successfully!');
        console.log('\nTest accounts:');
        console.log('Admin: admin@lms.com / Admin123!');
        console.log('Instructor: instructor@lms.com / Instructor123!');
        console.log('Student: student@lms.com / Student123!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

// Run seed
connectDB().then(seedData);
