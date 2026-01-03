
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
    };
    createdAt: string;
}

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();

    const { data: courses, isLoading } = useQuery({
        queryKey: ['allCourses'], // Using a different key than public courses
        queryFn: async () => {
            // Admin sees same list as public for now, but with delete powers
            // Ideally fetching ALL courses including drafts if implemented
            const res = await client.get('/courses');
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (courseId: string) => {
            await client.delete(`/courses/${courseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCourses'] });
            toast.success("Course deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete course");
        }
    });

    if (isLoading) return <div>Loading courses...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Manage Courses</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses?.map((course: Course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.instructor?.name || 'Unknown'}</TableCell>
                                <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => {
                                            if (confirm(`Delete course "${course.title}"?`)) {
                                                deleteMutation.mutate(course.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
