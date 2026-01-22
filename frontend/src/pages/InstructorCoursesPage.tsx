import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number | null;
    status: 'draft' | 'published' | 'pending' | 'rejected';
    thumbnail: string | null;
    students: { id: string }[];
    _count?: {
        students: number;
    }
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

export default function InstructorCoursesPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const debouncedSearch = useDebounce(search, 500);

    // Delete Dialog State
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; courseId: string | null }>({
        open: false,
        courseId: null,
    });


    const { data, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['instructor-courses-page', debouncedSearch, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch })
            });
            const res = await client.get(`/courses/instructor?${params}`);
            return res.data;
        },
    });

    const courses = data?.courses || [];
    const pagination = data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/courses/${id}`);
        },
        onSuccess: () => {
            toast.success('Course deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['instructor-courses-page'] });
            setDeleteDialog({ open: false, courseId: null });
        },
        onError: () => {
            toast.error('Failed to delete course');
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">Manage and publish your courses.</p>
                </div>
                <Link to="/courses/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search your courses..."
                        className="pl-8 bg-background"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-4 w-48 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-8 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {course.thumbnail && (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-10 h-10 rounded object-cover border"
                                                />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium">{course.title}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">{course.description}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            course.status === 'published' ? 'default' :
                                                course.status === 'draft' ? 'secondary' :
                                                    course.status === 'rejected' ? 'destructive' : 'outline'
                                        }>
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {course.price ? `$${course.price}` : 'Free'}
                                    </TableCell>
                                    <TableCell>
                                        {course.students?.length || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/courses/${course.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setDeleteDialog({ open: true, courseId: course.id })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {page} of {pagination.totalPages}
                    </div>
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
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this course? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, courseId: null })}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteDialog.courseId && deleteMutation.mutate(deleteDialog.courseId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
