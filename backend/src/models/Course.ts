import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CourseAttributes {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    price: number | null;
    thumbnail: string | null;
    rejectionReason: string | null;
}

interface CourseCreationAttributes extends Optional<CourseAttributes, 'id'> { }

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public instructorId!: string;
    public status!: 'draft' | 'pending' | 'published' | 'rejected';
    public price!: number | null;
    public thumbnail!: string | null;
    public rejectionReason!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public lessons?: any[];
    public students?: any[];
}

Course.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        instructorId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'),
            allowNull: false,
            defaultValue: 'draft',
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'courses',
    }
);

export default Course;
