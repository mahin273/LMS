import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface LessonProgressAttributes {
    studentId: string;
    lessonId: string;
    completedAt: Date;
}

class LessonProgress extends Model<LessonProgressAttributes> implements LessonProgressAttributes {
    public studentId!: string;
    public lessonId!: string;
    public completedAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

LessonProgress.init(
    {
        studentId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        lessonId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        completedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'lesson_progress',
    }
);

export default LessonProgress;
