import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BadgeDisplay } from './BadgeDisplay';
import { Progress } from "@/components/ui/progress"
import { Users, Star, ArrowRight, PlayCircle } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: { name: string };
    // Student props
    Enrollment?: { status: string; joinedAt: string };
    badges?: { type: string }[];
    // Stats
    studentCount?: number;
    averageRating?: number;
    progress?: number;
}

interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
}

export function CourseCard({ course, isEnrolled }: CourseCardProps) {
    const navigate = useNavigate();

    return (
        <Card className="group flex flex-col h-full overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            {/* Gradient Top Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-primary to-violet-500 opacity-70 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-primary transition-colors duration-300">
                        {course.title}
                    </CardTitle>
                    {course.averageRating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span>{course.averageRating}</span>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                    <CardDescription className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {course.instructor.name.charAt(0)}
                        </span>
                        {course.instructor.name}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {course.description || 'No description available for this course.'}
                </p>

                <div className="mt-auto space-y-3">
                    {isEnrolled ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Progress</span>
                                <span className={course.progress === 100 ? "text-green-500" : ""}>{course.progress || 0}%</span>
                            </div>
                            <Progress value={course.progress || 0} className="h-1.5" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {course.studentCount !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{course.studentCount} students</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <PlayCircle className="h-3.5 w-3.5" />
                                <span>Self-paced</span>
                            </div>
                        </div>
                    )}

                    {isEnrolled && course.badges && course.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {course.badges.map((b, i) => (
                                // @ts-ignore
                                <BadgeDisplay key={i} type={b.type} className="scale-75 origin-left" />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-2">
                {isEnrolled ? (
                    <Button
                        className="w-full gap-2 group-hover:translate-x-1 transition-transform duration-300"
                        onClick={() => navigate(`/courses/${course.id}`)}
                    >
                        Continue Learning <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                        variant="secondary"
                        onClick={() => navigate(`/courses/${course.id}`)}
                    >
                        View Details
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
