import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import client from '@/api/client';
import { toast } from 'sonner';
import { Ban, CheckCircle, Loader2, Mail } from 'lucide-react';

interface StudentData {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentAvatar: string | null;
    courseId: string;
    courseTitle: string;
    joinedAt: string;
    status: 'active' | 'completed' | 'dropped' | 'banned';
}

const MyStudentsPage = () => {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await client.get('/courses/instructor/students');
                setStudents(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleToggleBan = async (studentId: string, courseId: string, currentStatus: string) => {
        try {
            await client.post('/courses/instructor/student-status', {
                courseId,
                studentId
            });

            // Optimistic update
            setStudents(prev => prev.map(s => {
                if (s.studentId === studentId && s.courseId === courseId) {
                    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
                    return { ...s, status: newStatus as any };
                }
                return s;
            }));

            toast.success(currentStatus === 'banned' ? 'Student unbanned' : 'Student banned');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update student status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-destructive">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and view all students enrolled in your courses.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                        Total Students: {students.length}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No students found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student, index) => (
                                    <TableRow key={`${student.studentId}-${student.courseId}-${index}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.studentAvatar || undefined} />
                                                    <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{student.studentName}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {student.studentEmail}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="font-normal w-fit">
                                                    {student.courseTitle}
                                                </Badge>
                                                {student.status === 'banned' && (
                                                    <Badge variant="destructive" className="w-fit text-[10px] px-1.5 py-0 h-5">
                                                        Banned
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(student.joinedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {student.status === 'banned' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleBan(student.studentId, student.courseId, student.status)}
                                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Unban
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleBan(student.studentId, student.courseId, student.status)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Ban
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyStudentsPage;
