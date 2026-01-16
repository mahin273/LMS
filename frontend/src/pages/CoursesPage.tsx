import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Search, SlidersHorizontal, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

interface PaginatedResponse {
    courses: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function CoursesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 12;
    const debouncedSearch = useDebounce(search, 500);
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['public-courses', debouncedSearch, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch })
            });
            const res = await client.get(`/courses?${params}`);
            return res.data;
        }
    });

    const courses = data?.courses || [];
    const pagination = data?.pagination;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        Explore Courses
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-lg">
                        Discover new skills and advance your career with our comprehensive course catalog.
                    </p>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-10 bg-background/50 border-input/50 focus:bg-background transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Separator className="bg-border/50" />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[300px] rounded-xl bg-muted/20 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="min-h-[50vh]">
                    {courses.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted/10 mt-12">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Search className="h-8 w-8 opacity-40 " />
                                </div>
                                <h3 className="text-lg font-bold mb-2">No results found</h3>
                                <p className="text-sm max-w-sm mb-6">
                                    We couldn't find any courses matching "{search}". Try searching for something else.
                                </p>
                                <Button variant="outline" onClick={() => setSearch('')}>
                                    Clear Search
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {courses.map((course: any) => (
                                    <CourseCard key={course.id} course={course} isEnrolled={false} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center mt-8 gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {page} of {pagination.totalPages} ({pagination.total} courses)
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
