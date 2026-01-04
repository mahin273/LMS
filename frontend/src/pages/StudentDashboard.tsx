import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BadgeDisplay } from '@/components/BadgeDisplay';

export default function StudentDashboard() {
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['enrolled-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/enrolled');
            return res.data;
        }
    });

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await client.get('/users/profile');
            return res.data;
        }
    });

    if (isLoadingCourses) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Badges Section */}
            <div className="p-6 bg-card border rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>🏆</span> Your Achievements
                    </h2>
                </div>

                {profile?.badges && profile.badges.length > 0 ? (
                    <div className="flex gap-4 flex-wrap">
                        {Object.values(profile.badges.reduce((acc: any, badge: any) => {
                            acc[badge.type] = acc[badge.type] || { ...badge, count: 0 };
                            acc[badge.type].count += 1;
                            return acc;
                        }, {})).map((badge: any) => (
                            <BadgeDisplay key={badge.id} type={badge.type} count={badge.count} className="w-32 hover:translate-y-[-2px] transition-transform" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Complete lessons to earn your first badge!</p>
                    </div>
                )}
            </div>

            {/* Courses Section */}
            <div className="space-y-4">
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
        </div>
    );
}
