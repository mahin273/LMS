import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* Simple Logo Placeholder */}
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            LMS
                        </div>
                        <span className="text-xl font-bold tracking-tight">LearnPortal</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-20 md:py-32 px-4">
                    <div className="container mx-auto text-center max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
                        >
                            Master New Skills with <span className="text-primary">Ease</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg md:text-xl text-muted-foreground mb-8 text-balance"
                        >
                            An intuitive Learning Management System designed for students and modern educators. Track progress, earn badges, and excel in your studies.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8">Get Started</Button>
                            </Link>
                            <Link to="/courses">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">Browse Courses</Button>
                            </Link>
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
            </main>

            {/* Footer */}
            <footer className="border-t py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} LearnPortal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ title, description, delay }: { title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="p-6 rounded-xl bg-card border shadow-sm"
        >
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </motion.div>
    );
}
