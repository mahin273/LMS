import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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

interface PaginatedResponse {
    courses: Course[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const limit = 10;
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['admin-courses', debouncedSearch, page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter && { status: statusFilter })
            });
            const res = await client.get(`/courses/admin/all?${params}`);
            return res.data;
        }
    });

    const courses = data?.courses || [];
    const pagination = data?.pagination;

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
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val === 'all' ? '' : val); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="max-w-sm"
                    />
                </div>
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
                        {courses.map((course: Course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <Link to={`/courses/${course.id}`} className="hover:underline font-semibold cursor-pointer text-primary">
                                            {course.title}
                                        </Link>
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} courses
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
