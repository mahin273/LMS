import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
    const { data: courses, isLoading } = useQuery({
        queryKey: ['enrolled-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/enrolled');
            return res.data;
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Learning</h2>
                <Link to="/courses">
                    <Button variant="outline">Browse All Courses</Button>
                </Link>
            </div>

            {(!courses || courses.length === 0) ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <p className="text-lg text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
                    <Link to="/courses">
                        <Button>Find a Course</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => (
                        <CourseCard key={course.id} course={course} isEnrolled={true} />
                    ))}
                </div>
            )}
        </div>
    );
}
