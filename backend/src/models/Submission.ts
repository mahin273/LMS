import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SubmissionAttributes {
    id: string;
    assignmentId: string;
    studentId: string;
    fileUrl: string;
    submittedAt: Date;
}

interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id' | 'submittedAt'> { }

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
    public id!: string;
    public assignmentId!: string;
    public studentId!: string;
    public fileUrl!: string;
    public submittedAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Submission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        assignmentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        submittedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'submissions',
    }
);

export default Submission;
