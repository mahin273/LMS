import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface EnrollmentAttributes {
    studentId: string;
    courseId: string;
    status: 'active' | 'completed' | 'dropped';
    joinedAt: Date;
}

class Enrollment extends Model<EnrollmentAttributes> implements EnrollmentAttributes {
    public studentId!: string;
    public courseId!: string;
    public status!: 'active' | 'completed' | 'dropped';
    public joinedAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Enrollment.init(
    {
        studentId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        courseId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'dropped'),
            defaultValue: 'active',
        },
        joinedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'enrollments',
    }
);

export default Enrollment;
