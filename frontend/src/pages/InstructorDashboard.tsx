import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
    const { data: courses, isLoading } = useQuery({
        queryKey: ['instructor-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/managed');
            return res.data;
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
                            <CardHeader>
                                <CardTitle>{course.title}</CardTitle>
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
