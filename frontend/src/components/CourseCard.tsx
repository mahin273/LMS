import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from "@/components/ui/progress"
import { Users, Star, ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <Card className="group relative flex flex-col h-full overflow-hidden border-0 bg-transparent transition-all duration-300 hover:-translate-y-1">
            {/* Gradient Border Background */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 via-border to-primary/20 opacity-50 p-[1px] group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-xl bg-card/80 backdrop-blur-xl" />
            </div>

            {/* Inner Content - Z-index to sit above the background */}
            <div className="relative flex flex-col h-full rounded-xl z-10 p-0">

                {/* Decorative Top Gradient/Glow */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />

                <CardHeader className="pb-3 relative">
                    <div className="flex justify-between items-start gap-2">
                        {/* Badge/Tag */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 text-xs">
                                {course.instructor.name.charAt(0)}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Instructor</span>
                                <span className="text-xs font-medium">{course.instructor.name}</span>
                            </div>
                        </div>

                        {course.averageRating && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-sm">
                                <Star className="h-3 w-3 fill-amber-500" />
                                <span>{course.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300 pt-2">
                        {course.title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4 relative">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {course.description || 'No description available for this course.'}
                    </p>

                    <div className="mt-auto space-y-3 pt-2">
                        {isEnrolled ? (
                            <div className="space-y-2 bg-secondary/30 p-3 rounded-lg border border-border/50">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="h-3 w-3 text-primary" /> Progress
                                    </span>
                                    <span className={course.progress === 100 ? "text-green-500 font-bold" : "text-foreground"}>{course.progress || 0}%</span>
                                </div>
                                <Progress value={course.progress || 0} className="h-2 bg-secondary" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                {course.studentCount !== undefined && (
                                    <div className="flex items-center gap-1.5 bg-secondary/40 px-2 py-1 rounded-md">
                                        <Users className="h-3.5 w-3.5 text-primary/70" />
                                        <span>{course.studentCount} students</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 bg-secondary/40 px-2 py-1 rounded-md">
                                    <PlayCircle className="h-3.5 w-3.5 text-primary/70" />
                                    <span>Self-paced</span>
                                </div>
                            </div>
                        )}

                        {/* Badges Row */}
                        {isEnrolled && course.badges && course.badges.length > 0 && (
                            <div className="flex items-center gap-1 pt-1 overflow-x-auto scrollbar-hide">
                                {Object.entries(
                                    course.badges.reduce((acc: Record<string, number>, b: any) => {
                                        acc[b.type] = (acc[b.type] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([type, count]) => (
                                    <div
                                        key={type}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm whitespace-nowrap",
                                            type === 'MASTER' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                type === 'GOLD' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                                    type === 'SILVER' ? 'bg-slate-400/10 text-slate-500 border-slate-400/20' :
                                                        'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                        )}
                                        title={`${type} Badge`}
                                    >
                                        {type === 'MASTER' && '👑'}
                                        {type === 'GOLD' && '⭐'}
                                        {type === 'SILVER' && '🏆'}
                                        {type === 'BRONZE' && '🥉'}
                                        <span className="ml-0.5">{count > 1 ? `x${count}` : type}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-5 px-6 relative">
                    {isEnrolled ? (
                        <Button
                            className="w-full relative overflow-hidden group/btn shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Continue <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 transform -translate-x-full group-hover/btn:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                        </Button>
                    ) : (
                        <Button
                            className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300 group/btn"
                            variant="outline"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300 text-primary" />
                        </Button>
                    )}
                </CardFooter>
            </div>
        </Card>
    );
}
