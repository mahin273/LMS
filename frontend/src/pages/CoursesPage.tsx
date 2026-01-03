import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function CoursesPage() {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: courses, isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: async () => {
            const res = await client.get('/courses'); // /api/courses
            return res.data;
        }
    });

    const filteredCourses = courses?.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Explore Courses</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search courses..."
                        className="w-[300px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? <div>Loading catalog...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses?.map((course: any) => (
                        <CourseCard key={course.id} course={course} isEnrolled={false} />
                    ))}
                    {filteredCourses?.length === 0 && (
                        <p className="col-span-3 text-center text-muted-foreground">No courses found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
