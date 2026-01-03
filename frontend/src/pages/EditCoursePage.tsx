import { useState, useEffect } from 'react'; // Added useEffect
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form'; // Added useForm

export default function EditCoursePage() {
    const { courseId } = useParams();
    const queryClient = useQueryClient();
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const navigate = useNavigate(); // Hook for navigation

    const { data: lessons, isLoading } = useQuery({
        queryKey: ['lessons', courseId],
        queryFn: async () => {
            const res = await client.get(`/${courseId}/lessons`); // Matches lesson.routes.ts mount
            return res.data;
        }
    });

    const createLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.post(`/${courseId}/lessons`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
            setIsAddingLesson(false);
            reset();
        }
    });

    const onAddLesson = (data: any) => {
        createLessonMutation.mutate({
            ...data,
            orderIndex: lessons ? lessons.length + 1 : 1
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Course Curriculum</h1>
                <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
            </div>

            <div className="grid gap-6">
                {/* Lesson List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lessons</CardTitle>
                        <CardDescription>Manage the content of your course.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <p>Loading lessons...</p> : (
                            lessons?.length === 0 ? <p className="text-muted-foreground">No lessons yet.</p> : (
                                <div className="space-y-2">
                                    {lessons.map((lesson: any) => (
                                        <div key={lesson.id} className="p-4 border rounded-md flex justify-between items-center bg-card">
                                            <span>{lesson.orderIndex}. {lesson.title}</span>
                                            <span className="text-xs text-muted-foreground">Text Content</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {!isAddingLesson ? (
                            <Button onClick={() => setIsAddingLesson(true)} variant="outline" className="w-full mt-4">+ Add Lesson</Button>
                        ) : (
                            <div className="mt-4 p-4 border rounded-md bg-muted/20">
                                <form onSubmit={handleSubmit(onAddLesson)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Lesson Title</Label>
                                        <Input {...register('title', { required: true })} placeholder="e.g., Setting up the environment" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content (Markdown)</Label>
                                        <textarea
                                            {...register('content', { required: true })}
                                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="# Lesson Content\n\nWrite your lesson here..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={createLessonMutation.isPending}>
                                            {createLessonMutation.isPending ? 'Saving...' : 'Save Lesson'}
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={() => setIsAddingLesson(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
