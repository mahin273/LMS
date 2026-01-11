
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DatabaseSettingsPage() {
    const { data: stats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await client.get('/admin/stats');
            return res.data;
        }
    });

    const handleClearCache = async () => {
        const promise = client.post('/admin/clear-cache');
        toast.promise(promise, {
            loading: 'Clearing system cache...',
            success: 'Cache cleared successfully',
            error: 'Failed to clear cache'
        });
    };

    const handleResetDatabase = async () => {
        if (!confirm('WARNING: This will completely WIPE the database and reset it to initial seed data. All current users and courses will be lost. Are you sure?')) {
            return;
        }

        const promise = client.post('/admin/reset-db');

        toast.promise(promise, {
            loading: 'Resetting database... This may take a while.',
            success: () => {
                // Force logout as tokens are likely invalid
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 1500);
                return 'Database reset successfully. Redirecting...';
            },
            error: 'Failed to reset database'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Database Settings</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Connection Information</CardTitle>
                        <CardDescription>Current database configuration status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Status</span>
                            <span className="text-green-600 font-bold">{stats?.systemStatus || 'Checking...'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Engine</span>
                            <span className="text-muted-foreground">{stats?.dbVersion || 'MySQL'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Host</span>
                            <span className="text-muted-foreground">lms_mysql (Internal Docker Network)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance Actions</CardTitle>
                        <CardDescription>Perform administrative tasks on the database.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button variant="destructive" onClick={handleResetDatabase}>Reset Seed Data</Button>
                        <Button variant="outline" onClick={handleClearCache}>Clear Query Cache</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
