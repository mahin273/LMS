
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"

interface LogEntry {
    id: string;
    type: string;
    message: string;
    timestamp: string;
}

export default function SystemLogsPage() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['systemLogs'],
        queryFn: async () => {
            const res = await client.get('/admin/logs');
            return res.data;
        }
    });

    if (isLoading) return <div>Loading logs...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">System Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                            {logs?.map((log: LogEntry) => (
                                <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={log.type === 'USER_REGISTERED' ? 'default' : 'secondary'}>
                                                {log.type}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{log.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
