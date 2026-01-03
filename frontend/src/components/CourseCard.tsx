import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BadgeDisplay } from './BadgeDisplay';
import { Progress } from "@/components/ui/progress"

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: { name: string };
    // Student props
    Enrollment?: { status: string; joinedAt: string };
    badges?: { type: string }[];
    progress?: number;
}

interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
}

export function CourseCard({ course, isEnrolled }: CourseCardProps) {
    const navigate = useNavigate();

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>By {course.instructor.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {course.description || 'No description available.'}
                </p>

                {isEnrolled && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{course.progress || 0}%</span>
                        </div>
                        <Progress value={course.progress || 0} />
                    </div>
                )}

                {isEnrolled && course.badges && course.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {course.badges.map((b, i) => (
                            // @ts-ignore
                            <BadgeDisplay key={i} type={b.type} />
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {isEnrolled ? (
                    <Button className="w-full" onClick={() => navigate(`/courses/${course.id}`)}>
                        Continue Learning
                    </Button>
                ) : (
                    <Button className="w-full" variant="secondary" onClick={() => navigate(`/courses/${course.id}`)}>
                        View Details
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
