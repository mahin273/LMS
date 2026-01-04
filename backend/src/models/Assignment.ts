import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AssignmentAttributes {
    id: string;
    courseId: string;
    title: string;
    description: string;
    dueDate?: Date;
    lessonId?: string;
}

interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id'> { }

class Assignment extends Model<AssignmentAttributes, AssignmentCreationAttributes> implements AssignmentAttributes {
    public id!: string;
    public courseId!: string;
    public title!: string;
    public description!: string;
    public dueDate?: Date;
    public lessonId?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Assignment.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lessonId: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'assignments',
    }
);

export default Assignment;
