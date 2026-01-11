
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from '@/api/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Shield, Ban, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    status: 'active' | 'banned';
    createdAt: string;
}

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery<any>({
        queryKey: ['users', page, search, roleFilter, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
                role: roleFilter,
                status: statusFilter
            });
            const res = await client.get(`/admin/users?${params}`);
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;

    // --- Mutations ---

    const statusMutation = useMutation({
        mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
            await client.patch(`/admin/users/${userId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("User status updated");
        },
        onError: () => toast.error("Failed to update status")
    });

    const roleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            await client.patch(`/admin/users/${userId}/role`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("User role updated");
        },
        onError: () => toast.error("Failed to update role")
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (userId: string) => {
            await client.post(`/admin/users/${userId}/reset-password`);
        },
        onSuccess: () => toast.success("Password reset to 'password123'"),
        onError: () => toast.error("Failed to reset password")
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await client.delete(`/users/${userId}`); // Assuming this endpoint exists from before or use status 'deleted'
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("User deleted");
        }
    });

    const handleAction = (action: string, user: User, value?: string) => {
        if (action === 'status') {
            statusMutation.mutate({ userId: user.id, status: value! });
        } else if (action === 'role') {
            roleMutation.mutate({ userId: user.id, role: value! });
        } else if (action === 'reset') {
            if (confirm(`Reset password for ${user.name}?`)) {
                resetPasswordMutation.mutate(user.id);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users, roles, and access.</p>
                </div>
                <div className="bg-secondary/20 px-4 py-2 rounded-lg">
                    <span className="font-semibold">{data?.total || 0}</span> Total Users
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                    setSearch('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                }}>
                    Reset
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.role === 'admin' ? 'default' :
                                                user.role === 'instructor' ? 'secondary' : 'outline'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className={user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        {user.role !== 'admin' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Shield className="mr-2 h-4 w-4" /> Change Role
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleAction('role', user, 'student')}>
                                                                    Student
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleAction('role', user, 'instructor')}>
                                                                    Instructor
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>

                                                    <DropdownMenuItem onClick={() => handleAction('status', user, user.status === 'active' ? 'banned' : 'active')}>
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        {user.status === 'active' ? 'Ban User' : 'Unban User'}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => handleAction('reset', user)}>
                                                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => {
                                                        if (confirm('Delete user permanentl?')) deleteMutation.mutate(user.id)
                                                    }}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
