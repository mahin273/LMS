
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

    const handleClearCache = () => {
        // Mock action
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Clearing system cache...',
                success: 'Cache cleared successfully',
                error: 'Failed to clear cache'
            }
        );
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
                        <Button variant="destructive">Reset Seed Data (Disabled)</Button>
                        <Button variant="outline" onClick={handleClearCache}>Clear Query Cache</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
