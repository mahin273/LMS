import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, type Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Star, BookOpen, Users } from 'lucide-react';

import logo from '@/assets/logo.png';
import landingImage from '@/assets/Landing_page.png';
import { ModeToggle } from '@/components/mode-toggle';

export default function LandingPage() {
    const { data: courses, isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/public');
            return res.data;
        }
    });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    };

    const floatVariants: Variants = {
        animate: {
            y: [0, -20, 0] as any,
            rotate: [0, 1, -1, 0] as any,
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const featuredCourses = courses?.slice(0, 3);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
            {/* Navbar */}
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50 transition-all duration-300">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <img src={logo} alt="LMS Logo" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight">LearnPortal</span>
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 items-center"
                    >
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Sign Up</Button>
                        </Link>
                        <ModeToggle />
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-20 md:py-32 px-4 relative overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px]"
                        />
                    </div>

                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="text-center md:text-left z-10"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight"
                            >
                                Master New Skills with <br />
                                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                    Magic & Ease
                                </span>
                            </motion.h1>
                            <motion.p
                                variants={itemVariants}
                                className="text-lg md:text-xl text-muted-foreground mb-8 text-balance"
                            >
                                An intuitive Learning Management System designed for students and modern educators. Track progress, earn badges, and excel in your studies.
                            </motion.p>
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                            >
                                <Link to="/register">
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/courses">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                                        Browse Courses
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10"
                        >
                            <motion.div
                                variants={floatVariants}
                                animate="animate"
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                            >
                                <img
                                    src={landingImage}
                                    alt="Dashboard Preview"
                                    className="w-full object-cover drop-shadow-2xl"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features / About Section */}
                <section className="py-16 bg-muted/30 border-t">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose LearnPortal?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                title="Interactive Learning"
                                description="Engage with rich content, markdown lessons, and comprehensive course materials tailored for you."
                                delay={0.2}
                            />
                            <FeatureCard
                                title="Track Progress"
                                description="Visual progress bars and real-time status updates help you stay on top of your learning goals."
                                delay={0.4}
                            />
                            <FeatureCard
                                title="Gamification"
                                description="Earn badges and achievements as you complete lessons. Make learning fun and rewarding."
                                delay={0.6}
                            />
                        </div>
                    </div>
                </section>

                {/* Featured Courses Section */}
                <section className="py-20 px-4">
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Popular Courses</h2>
                            <p className="text-muted-foreground">Explore our highest-rated courses and start learning today.</p>
                        </div>

                        {isLoading ? (
                            <div className="text-center">Loading courses...</div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-6">
                                {featuredCourses?.map((course: any, index: number) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                        {course.category || 'General'}
                                                    </Badge>
                                                    <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                                                        <Star className="h-3 w-3 fill-current mr-1" />
                                                        {course.averageRating ? Number(course.averageRating).toFixed(1) : 'New'}
                                                    </div>
                                                </div>
                                                <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-4 w-4 text-primary/70" />
                                                        {course.enrollmentCount || 0} students
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen className="h-4 w-4 text-primary/70" />
                                                        {course.lessonsCount || 0} lessons
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Link to={`/courses/${course.id}`} className="w-full">
                                                    <Button className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 group">
                                                        View Course
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="text-center mt-12">
                            <Link to="/courses">
                                <Button variant="outline" size="lg">View All Courses</Button>
                            </Link>
                        </div>
                    </div>
                </section>


            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">LMS</div>
                                <span className="font-bold">LearnPortal</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Empowering students and educators worldwide with cutting-edge learning tools.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/courses" className="hover:text-primary">Browse Courses</Link></li>
                                <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
                                <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
                                <li><Link to="/community" className="hover:text-primary">Community</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} LearnPortal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ title, description, delay }: { title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 50 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
        >
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {title.includes("Interactive") ? <BookOpen className="h-6 w-6" /> :
                    title.includes("Track") ? <Users className="h-6 w-6" /> :
                        <Star className="h-6 w-6" />}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </motion.div>
    );
}


