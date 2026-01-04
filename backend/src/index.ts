import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import './models'; // Register models and associations
import sequelize from './config/database';

import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lessonRoutes from './routes/lesson.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import { courseAssignmentRoutes, assignmentRoutes } from './routes/assignment.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow serving static files
}));
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', lessonRoutes); // Mounts /:courseId/lessons
app.use('/api', lessonRoutes); // Mounts /lessons/:lessonId
app.use('/api/courses', courseAssignmentRoutes); // Mounts /:courseId/assignments
app.use('/api/assignments', assignmentRoutes); // Mounts /:id (delete)
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'LMS API is running' });
});

const startServer = async () => {
    let retries = 10;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('Database connected.');
            await sequelize.sync({ alter: true });
            console.log('Database synced.');

            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            return;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            retries -= 1;
            console.log(`Retries left: ${retries}. Waiting 5s...`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('Could not connect to database after retries. Exiting.');
    process.exit(1);
};

startServer();
