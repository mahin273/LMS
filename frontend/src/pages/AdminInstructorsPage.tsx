import { useState } from 'react';
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

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: 'active' | 'pending' | 'rejected';
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

export default function AdminInstructorsPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const limit = 10;
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading } = useQuery<PaginatedResponse>({
        queryKey: ['users', 'instructor', debouncedSearch, page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                role: 'instructor',
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter && { status: statusFilter })
            });
            const res = await client.get(`/users?${params}`);
            return res.data;
        }
    });

    const users = data?.users || [];
    const pagination = data?.pagination;

    const updateStatusMutation = useMutation({
        mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
            await client.put(`/users/${userId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("Instructor status updated");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await client.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("Instructor deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete instructor");
        }
    });

    if (isLoading) return <div>Loading instructors...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Instructors</h1>
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val === 'all' ? '' : val); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search by name or email..."
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>
                                        {user.status || 'active'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    {user.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'active' })}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive"
                                                onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'rejected' })}
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
                                            if (confirm(`Delete instructor ${user.name}? This will affect their courses.`)) {
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
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} instructors
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
