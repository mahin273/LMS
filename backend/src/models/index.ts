import User from './User';
import Course from './Course';
import Lesson from './Lesson';
import Enrollment from './Enrollment';
import LessonProgress from './LessonProgress';
import Badge from './Badge';
import Assignment from './Assignment';
import Submission from './Submission';

// Associations

// Instructor -> Courses
User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course -> Lessons
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Enrollment (Student <-> Course)
User.belongsToMany(Course, { through: Enrollment, foreignKey: 'studentId', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId', as: 'students' });

// Lesson Progress (Student <-> Lesson)
User.belongsToMany(Lesson, { through: LessonProgress, foreignKey: 'studentId', as: 'completedLessons' });
Lesson.belongsToMany(User, { through: LessonProgress, foreignKey: 'lessonId', as: 'completedBy' });

// Badges
User.hasMany(Badge, { foreignKey: 'studentId', as: 'badges' });
Badge.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Badge, { foreignKey: 'courseId', as: 'badges' });
Badge.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Assignments
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Assignment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Submissions
Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

User.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

export {
    User,
    Course,
    Lesson,
    Enrollment,
    LessonProgress,
    Badge,
    Assignment,
    Submission,
};
