import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(['student', 'instructor']).optional(), // Admin should be seeded or manual
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const courseSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
});
