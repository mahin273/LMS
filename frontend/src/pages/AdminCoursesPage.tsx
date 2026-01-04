import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';


interface Course {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    instructor: {
        name: string;
        email: string;
    };
    students: any[];
    createdAt: string;
}

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    // We used getAllCoursesAdmin endpoint
    const { data: courses, isLoading } = useQuery({
        queryKey: ['admin-courses', debouncedSearch],
        queryFn: async () => {
            const res = await client.get('/courses/admin/all');
            return res.data;
        }
    });

    // Filter client-side for search for now, or implement backend search later
    const filteredCourses = courses?.filter((c: Course) =>
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.instructor.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await client.put(`/courses/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success("Course status updated");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/courses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success("Course deleted");
        },
        onError: () => {
            toast.error("Failed to delete course");
        }
    });

    if (isLoading) return <div>Loading courses...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Courses</h1>
                <Input
                    placeholder="Search courses or instructors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses?.map((course: Course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{course.title}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{course.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{course.instructor.name}</span>
                                        <span className="text-xs text-muted-foreground">{course.instructor.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        course.status === 'published' ? 'default' :
                                            course.status === 'pending' ? 'secondary' :
                                                course.status === 'rejected' ? 'destructive' : 'outline'
                                    }>
                                        {course.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{course.students?.length || 0}</TableCell>
                                <TableCell className="text-right space-x-2">

                                    {course.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'published' })}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive border-destructive hover:bg-destructive/10"
                                                onClick={() => updateStatusMutation.mutate({ id: course.id, status: 'rejected' })}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
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
