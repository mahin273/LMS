import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BadgeAttributes {
    id: string;
    studentId: string;
    courseId: string;
    type: 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER';
    awardedAt: Date;
}

interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id' | 'awardedAt'> { }

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
    public id!: string;
    public studentId!: string;
    public courseId!: string;
    public type!: 'BRONZE' | 'SILVER' | 'GOLD' | 'MASTER';
    public awardedAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Badge.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'MASTER'),
            allowNull: false,
        },
        awardedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'badges',
    }
);

export default Badge;
