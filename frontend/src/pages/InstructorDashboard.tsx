import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InstructorDashboard() {
    const queryClient = useQueryClient();
    const { data: courses, isLoading } = useQuery({
        queryKey: ['instructor-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/instructor'); // Updated endpoint to match routes
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (courseId: string) => {
            await client.delete(`/courses/${courseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success("Course deleted");
        },
        onError: () => {
            toast.error("Failed to delete course");
        }
    });

    if (isLoading) return <div>Loading courses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Managed Courses</h2>
                <Link to="/courses/new">
                    <Button>Create New Course</Button>
                </Link>
            </div>

            {courses?.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        You haven't created any courses yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => (
                        <Card key={course.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="leading-tight">{course.title}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        if (confirm(`Delete "${course.title}"?`)) {
                                            deleteMutation.mutate(course.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4">
                                    {course.students?.length || 0} Students Enrolled
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/courses/${course.id}/edit`} className="w-full">
                                        <Button variant="outline" className="w-full">Edit Content</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
