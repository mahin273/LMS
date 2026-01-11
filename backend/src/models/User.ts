import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
    id: string;
    email: string;
    password_hash?: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    status: 'active' | 'pending' | 'rejected';
    googleId?: string;
    magicLinkToken?: string;
    magicLinkExpiresAt?: Date;
    bio?: string;
    avatarUrl?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public password_hash!: string;
    public name!: string;
    public role!: 'student' | 'instructor' | 'admin';
    public status!: 'active' | 'pending' | 'rejected';
    public googleId!: string;
    public magicLinkToken!: string;
    public magicLinkExpiresAt!: Date;
    public bio!: string;
    public avatarUrl!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('student', 'instructor', 'admin'),
            allowNull: false,
            defaultValue: 'student',
        },
        status: {
            type: DataTypes.ENUM('active', 'pending', 'rejected'),
            allowNull: false,
            defaultValue: 'active',
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        magicLinkToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        magicLinkExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
