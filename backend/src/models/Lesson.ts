import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LessonAttributes {
    id: string;
    courseId: string;
    title: string;
    content: string; // Markdown or text content
    fileUrl?: string;
    orderIndex: number;
}

interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'fileUrl'> { }

class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
    public id!: string;
    public courseId!: string;
    public title!: string;
    public content!: string;
    public fileUrl?: string;
    public orderIndex!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Lesson.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        orderIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'lessons',
    }
);

export default Lesson;
