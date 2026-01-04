import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Users, BookOpen, MoreVertical, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export default function InstructorDashboard() {
    const queryClient = useQueryClient();
    const { data: courses, isLoading } = useQuery({
        queryKey: ['instructor-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/instructor');
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="h-4 w-32 rounded bg-muted"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Instructor Portal
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your courses and track student progress.
                    </p>
                </div>
                <Link to="/courses/new">
                    <Button className="shadow-lg shadow-primary/20 gap-2">
                        <Plus className="h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Managed Courses
                    </h2>
                    {courses?.length > 0 && (
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            {courses.length} Total
                        </span>
                    )}
                </div>

                {(!courses || courses.length === 0) ? (
                    <Card className="border-dashed border-2 bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold mb-2">No courses created</h3>
                            <p className="text-sm max-w-sm mb-6">Start sharing your knowledge by creating your first course today.</p>
                            <Link to="/courses/new">
                                <Button>Create Course</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course: any) => (
                            <Card key={course.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                                <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-600" />
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="leading-tight text-lg line-clamp-2 min-h-[3.5rem]">
                                            {course.title}
                                        </CardTitle>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link to={`/courses/${course.id}/edit`}>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`Delete "${course.title}"?`)) {
                                                            deleteMutation.mutate(course.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {course.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{course.students?.length || 0} Students</span>
                                        </div>
                                        {/* Add more stats here if available, e.g. rating, revenue */}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Link to={`/courses/${course.id}/edit`} className="w-full">
                                        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            Manage Content
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
