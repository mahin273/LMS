import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface PaginatedResponse {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function AdminStudentsPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['users', 'student', debouncedSearch, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                role: 'student',
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch })
            });
            const res = await client.get(`/users?${params}`);
            return res.data;
        }
    });

    const users = data?.users || [];
    const pagination = data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await client.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("Student deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete student");
        }
    });

    if (isLoading) return <div>Loading students...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Students</h1>
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => {
                                            if (confirm(`Delete student ${user.name}? This cannot be undone.`)) {
                                                deleteMutation.mutate(user.id);
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
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} students
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
