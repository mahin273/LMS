export interface Course {
    id: number;
    title: string;
    description: string;
    instructorId: number;
    thumbnail?: string;
    category?: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    createdAt: string;
    updatedAt: string;
    progress?: number; // Optional for dashboard view
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    badges?: { id: number; type: string;[key: string]: any }[];
}
