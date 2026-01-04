import { useState, useEffect } from 'react';
import { PlusCircle, Upload, FileText, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from "@/components/ui/progress";

export default function EditCoursePage() {
    const { courseId } = useParams();
    const queryClient = useQueryClient();
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    // Separate form for course details
    const { register: registerCourse, handleSubmit: handleSubmitCourse, reset: resetCourse } = useForm();

    const navigate = useNavigate();

    // 1. Fetch Lessons
    const { data: lessons, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['lessons', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/lessons`);
            return res.data;
        }
    });

    // 2. Fetch Course Details (Reuse logic or separate endpoint? For now assume we need to fetch it)
    // Ideally we have an endpoint for single course details. For now, let's fetch strictly for 'edit'
    // But wait, we don't have a single course GET endpoint for instructors easily accessible without ID.
    // Let's implement a quick fetch for current course details from the specific endpoint or list?
    // Actually, getPublicCourses returns all, but filters. 
    // Let's just use the instructor list and filter client side OR add a getCourseById endpoint. 
    // Assuming getInstructorCourses is cached. 
    // Better: Add getCourseById endpoint for easier editing. 
    // For now, I'll rely on the dashboard cache or fetching from list.
    // Re-impl: Let's assume we can fetch it. 
    const { data: course, isLoading: isLoadingCourse } = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            // We need a way to fetch single course details. 
            // Currently our API is getPublicCourses (all) or getInstructorCourses (all).
            // Let's rely on getInstructorCourses for now and find it.
            const res = await client.get('/courses/instructor');
            return res.data.find((c: any) => c.id === courseId);
        }
    });

    // Update settings form when data loads
    useEffect(() => {
        if (course) {
            resetCourse({
                title: course.title,
                description: course.description
            });
        }
    }, [course, resetCourse]);

    const updateCourseMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.put(`/courses/${courseId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
            toast.success("Course updated");
        },
        onError: () => {
            toast.error("Failed to update course");
        }
    });

    const createLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.post(`/courses/${courseId}/lessons`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
            setIsAddingLesson(false);
            reset();
        }
    });

    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFileUrl(res.data.url);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    const updateLessonMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.put(`/lessons/${editingLessonId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
            setIsAddingLesson(false);
            setEditingLessonId(null);
            setFileUrl(null);
            reset();
            toast.success("Lesson updated");
        }
    });

    const onAddLesson = (data: any) => {
        // Extract URL from iframe if present
        let cleanVideoUrl = data.videoUrl;
        if (cleanVideoUrl && cleanVideoUrl.includes('<iframe')) {
            const srcMatch = cleanVideoUrl.match(/src=["'](.*?)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanVideoUrl = srcMatch[1];
            }
        }

        const lessonData = {
            ...data,
            videoUrl: cleanVideoUrl,
            fileUrl: fileUrl || undefined
        };

        if (editingLessonId) {
            updateLessonMutation.mutate(lessonData);
        } else {
            createLessonMutation.mutate({
                ...lessonData,
                orderIndex: lessons ? lessons.length + 1 : 1,
            });
        }
    };

    const handleEditLesson = (lesson: any) => {
        setEditingLessonId(lesson.id);
        setIsAddingLesson(true);
        setFileUrl(lesson.fileUrl);
        // Timeout to allow form to mount if conditional rendering is instant
        setTimeout(() => {
            reset({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl
            });
        }, 0);
    };

    if (isLoadingCourse || isLoadingLessons) return <div>Loading...</div>;

    const submitCourseMutation = useMutation({
        mutationFn: async () => {
            return client.post(`/courses/${courseId}/submit`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success("Course submitted for review");
        },
        onError: () => {
            toast.error("Failed to submit course");
        }
    });

    if (isLoadingCourse || isLoadingLessons) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Edit Course: {course?.title}</h1>
                    <Badge variant={course?.status === 'published' ? 'default' : course?.status === 'pending' ? 'secondary' : 'outline'}>
                        {course?.status || 'draft'}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    {course?.status === 'draft' && (
                        <Button
                            onClick={() => {
                                if (confirm("Submit this course for admin approval? You won't be able to edit it while pending.")) {
                                    submitCourseMutation.mutate();
                                }
                            }}
                            disabled={submitCourseMutation.isPending}
                        >
                            {submitCourseMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                    )}
                    <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
                </div>
            </div>

            <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="students">Enrolled Students</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="settings">Course Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="lessons">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lessons</CardTitle>
                            <CardDescription>Manage the content of your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {lessons?.length === 0 ? <p className="text-muted-foreground">No lessons yet.</p> : (
                                <div className="space-y-2">
                                    {lessons?.map((lesson: any) => (
                                        <div key={lesson.id} className="p-4 border rounded-md flex justify-between items-center bg-card">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{lesson.orderIndex}. {lesson.title}</span>
                                                {lesson.fileUrl && <Badge variant="secondary" className="text-xs">With Attachment</Badge>}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>Edit</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm("Delete lesson?")) {
                                                            client.delete(`/lessons/${lesson.id}`)
                                                                .then(() => {
                                                                    toast.success("Lesson deleted");
                                                                    queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
                                                                })
                                                                .catch(err => toast.error("Failed to delete lesson"));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isAddingLesson ? (
                                <Button onClick={() => { setIsAddingLesson(true); setEditingLessonId(null); reset({ title: '', content: '', videoUrl: '' }); setFileUrl(null); }} variant="outline" className="w-full mt-4">+ Add Lesson</Button>
                            ) : (
                                <div className="mt-4 p-4 border rounded-md bg-muted/20">
                                    <form onSubmit={handleSubmit(onAddLesson)} className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold">{editingLessonId ? 'Edit Lesson' : 'New Lesson'}</h3>
                                        </div>
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
                                        <div className="space-y-2">
                                            <Label>Video URL (YouTube Embed Link)</Label>
                                            <Input {...register('videoUrl')} placeholder="https://www.youtube.com/embed/..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lesson Material (Optional)</Label>
                                            <Input type="file" onChange={handleFileUpload} disabled={uploading} />
                                            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                                            {fileUrl && <p className="text-xs text-green-600">File attached!</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={createLessonMutation.isPending || updateLessonMutation.isPending || uploading}>
                                                {createLessonMutation.isPending || updateLessonMutation.isPending ? 'Saving...' : 'Save Lesson'}
                                            </Button>
                                            <Button type="button" variant="ghost" onClick={() => { setIsAddingLesson(false); setEditingLessonId(null); setFileUrl(null); }}>Cancel</Button>
                                        </div>

                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Update your course information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitCourse(onUpdateCourse)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Course Title</Label>
                                    <Input {...registerCourse('title', { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea {...registerCourse('description', { required: true })} className="min-h-[100px]" />
                                </div>
                                <Button type="submit" disabled={updateCourseMutation.isPending}>
                                    {updateCourseMutation.isPending ? 'Saving...' : 'Update Course'}
                                </Button>
                            </form>
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-md bg-destructive/5">
                                    <div>
                                        <p className="font-medium text-destructive">Delete this course</p>
                                        <p className="text-sm text-muted-foreground">Once deleted, it will be gone forever. Please be certain.</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            const confirmText = prompt("Type 'DELETE' to confirm course deletion:");
                                            if (confirmText === 'DELETE') {
                                                client.delete(`/courses/${courseId}`)
                                                    .then(() => {
                                                        toast.success("Course deleted");
                                                        navigate('/dashboard');
                                                    })
                                                    .catch(() => toast.error("Failed to delete course"));
                                            }
                                        }}
                                    >
                                        Delete Course
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrolled Students</CardTitle>
                            <CardDescription>View all students enrolled in this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course?.students?.length === 0 ? (
                                <p className="text-muted-foreground">No students enrolled yet.</p>
                            ) : (
                                <div className="divide-y">
                                    {course?.students?.map((student: any) => (
                                        <div key={student.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                            </div>
                                            <Badge variant="outline">Enrolled</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <AssignmentsTab courseId={courseId!} lessons={lessons || []} />
                </TabsContent>

                <TabsContent value="analytics">
                    <AnalyticsTab courseId={courseId!} />
                </TabsContent>
            </Tabs >
        </div >
    );
}

function AnalyticsTab({ courseId }: { courseId: string }) {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/analytics`);
            return res.data;
        }
    });

    if (isLoading) return <p>Loading analytics...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Analytics</CardTitle>
                <CardDescription>Track student progress and completion rates.</CardDescription>
            </CardHeader>
            <CardContent>
                {analytics?.length === 0 ? (
                    <p className="text-muted-foreground">No student data available.</p>
                ) : (
                    <div className="space-y-6">
                        {analytics?.map((item: any) => (
                            <div key={item.student.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-medium">{item.student.name}</span>
                                        <span className="text-muted-foreground ml-2">({item.student.email})</span>
                                    </div>
                                    <span className="font-bold">{item.progress}%</span>
                                </div>
                                <Progress value={item.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground text-right">
                                    {item.completedLessons} of {item.totalLessons} lessons completed
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function AssignmentsTab({ courseId, lessons }: { courseId: string, lessons: any[] }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    const { data: assignments, isLoading } = useQuery({
        queryKey: ['assignments', courseId],
        queryFn: async () => {
            const res = await client.get(`/courses/${courseId}/assignments`);
            return res.data;
        }
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (data: any) => {
            return client.post(`/courses/${courseId}/assignments`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            reset();
            toast.success("Assignment created");
        }
    });

    const deleteAssignmentMutation = useMutation({
        mutationFn: async (id: string) => {
            return client.delete(`/assignments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            toast.success("Assignment deleted");
        }
    });

    const onSubmit = (data: any) => {
        createAssignmentMutation.mutate(data);
    };

    if (isLoading) return <p>Loading assignments...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Create and manage course assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {assignments?.length === 0 ? <p className="text-muted-foreground">No assignments yet.</p> : (
                        assignments?.map((assignment: any) => (
                            <div key={assignment.id} className="p-4 border rounded-md flex justify-between items-center bg-card">
                                <div>
                                    <p className="font-medium">{assignment.title}</p>
                                    <p className="text-xs text-muted-foreground">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedAssignmentId(assignment.id)}>
                                                View Submissions
                                            </Button>
                                        </DialogTrigger>
                                        {selectedAssignmentId === assignment.id && (
                                            <SubmissionsDialog assignmentId={assignment.id} courseId={courseId} />
                                        )}
                                    </Dialog>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => {
                                            if (confirm("Delete assignment?")) deleteAssignmentMutation.mutate(assignment.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Add New Assignment</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input {...register('title', { required: true })} placeholder="Assignment Title" />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" {...register('dueDate')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Associated Lesson (Optional)</Label>
                            <select
                                {...register('lessonId')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">No specific lesson</option>
                                {lessons?.map((l: any) => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea {...register('description')} placeholder="Instructions for students..." />
                        </div>
                        <Button type="submit" disabled={createAssignmentMutation.isPending}>
                            {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

function SubmissionsDialog({ assignmentId, courseId }: { assignmentId: string, courseId: string }) {
    const queryClient = useQueryClient();
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['submissions', assignmentId],
        queryFn: async () => {
            // Note: We need to use the nested route because that's where we defined getSubmissions
            // Route defined: router.get('/:id/submissions', ...) under /api/courses/:courseId/assignments
            // So URL is: /api/courses/:courseId/assignments/:assignmentId/submissions
            const res = await client.get(`/courses/${courseId}/assignments/${assignmentId}/submissions`);
            return res.data;
        }
    });

    const gradeMutation = useMutation({
        mutationFn: async ({ id, grade, feedback }: any) => {
            return client.put(`/assignments/submissions/${id}/grade`, { grade, feedback });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
            toast.success("Grade saved");
        }
    });

    if (isLoading) return <DialogContent>Loading submissions...</DialogContent>;

    return (
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Student Submissions</DialogTitle>
                <DialogDescription>Review and grade student work.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
                {submissions?.length === 0 ? (
                    <p className="text-muted-foreground">No submissions yet.</p>
                ) : (
                    submissions?.map((sub: any) => (
                        <div key={sub.id} className="p-4 border rounded-md space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{sub.student.name}</p>
                                    <p className="text-xs text-muted-foreground">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                        View File
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-3 rounded text-sm">
                                <div>
                                    <Label className="text-xs">Grade (0-100)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={sub.grade}
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val && val !== String(sub.grade)) {
                                                gradeMutation.mutate({ id: sub.id, grade: parseInt(val), feedback: sub.feedback });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-xs">Feedback</Label>
                                    <Input
                                        defaultValue={sub.feedback}
                                        placeholder="Good job..."
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val !== sub.feedback) {
                                                // Ideally we submit both, but here we might trigger on just one change. 
                                                // Let's rely on a separate save button for cleaner UX or just auto-save.
                                                // Current implementation: Auto-save on blur if changed.
                                                // We need the current grade to submit with feedback.
                                                gradeMutation.mutate({ id: sub.id, grade: sub.grade, feedback: val });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DialogContent>
    );
}
