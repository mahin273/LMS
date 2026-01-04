
import { Request, Response } from 'express';
import { Assignment } from '../models';

export const getAssignments = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    try {
        const assignments = await Assignment.findAll({ where: { courseId } });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { title, description, dueDate } = req.body;
    try {
        const assignment = await Assignment.create({
            courseId,
            title,
            description,
            dueDate
        });
        res.status(201).json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
};

export const deleteAssignment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const assignment = await Assignment.findByPk(id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        await assignment.destroy();
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
};

import { Submission, User } from '../models';

export const getSubmissions = async (req: Request, res: Response) => {
    const { id } = req.params; // Assignment ID
    try {
        const submissions = await Submission.findAll({
            where: { assignmentId: id },
            include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }]
        });
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const gradeSubmission = async (req: Request, res: Response) => {
    const { id } = req.params; // Submission ID
    const { grade, feedback } = req.body;

    try {
        const submission = await Submission.findByPk(id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });

        submission.grade = grade;
        submission.feedback = feedback;
        await submission.save();

        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Failed to grade submission' });
    }
};
