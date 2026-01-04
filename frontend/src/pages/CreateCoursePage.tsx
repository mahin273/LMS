import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormData = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(courseSchema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            const res = await client.post('/courses', data);
            navigate(`/courses/${res.data.id}/edit`);
        } catch (err: any) {
            setError('Failed to create course');
        }
    };

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-2xl animate-in fade-in-50 zoom-in-95 duration-500">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>

                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-8 border-b border-border/10">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Rocket className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                            Create New Course
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Give your course a catchy title and a clear description to attract students.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base">Course Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Advanced React Patterns"
                                    className="h-12 text-lg bg-background/50 border-input/50 focus:border-primary/50 transition-all"
                                    {...register('title')}
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base">Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[120px] w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="What will students accomplish in this course?"
                                    {...register('description')}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Continue to Curriculum'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    You can add lessons, quizzes, and assignments in the next step.
                </p>
            </div>
        </div>
    );
}
