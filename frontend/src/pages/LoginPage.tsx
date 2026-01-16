// ... imports
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import client from '@/api/client'
import { setToken } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Lock, Mail, Chrome, Wand2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner' // Assuming sonner is installed
import logo from '@/assets/logo.png';
import { motion, type Variants } from 'framer-motion';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
})

const magicLinkSchema = z.object({
    email: z.string().email(),
})

type FormData = z.infer<typeof loginSchema>
type MagicLinkData = z.infer<typeof magicLinkSchema>

export default function LoginPage() {
    const navigate = useNavigate()
    const { refetchUser } = useAuth()
    const [loginError, setLoginError] = useState('')

    // Login Form
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(loginSchema)
    })

    // Magic Link Form
    const { register: registerMagic, handleSubmit: handleSubmitMagic, formState: { errors: errorsMagic, isSubmitting: isSubmittingMagic }, reset: resetMagic } = useForm<MagicLinkData>({
        resolver: zodResolver(magicLinkSchema)
    })


    const onSubmit = async (data: FormData) => {
        try {
            setLoginError('')
            const res = await client.post('/auth/login', data)
            setToken(res.data.token)
            await refetchUser()
            navigate('/dashboard')
        } catch (err: any) {
            setLoginError(err.response?.data?.error || 'Login failed')
        }
    }

    const onMagicLinkSubmit = async (data: MagicLinkData) => {
        try {
            await client.post('/auth/magic-link', data)
            toast.success("Instant Login link sent! Check your email.")
            resetMagic()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send Instant Login link')
        }
    }

    const handleGoogleLogin = () => {
        // Redirect to backend Google Auth URL
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/google`;
    }

    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                duration: 0.5,
                bounce: 0.3
            }
        }
    };

    const backgroundBlobVariants: Variants = {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
            transition: {
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <motion.div
                    variants={backgroundBlobVariants}
                    animate="animate"
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"
                />
                <motion.div
                    variants={backgroundBlobVariants}
                    animate="animate"
                    transition={{ delay: 2 }} // Stagger background animation
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]"
                />
            </div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md px-4"
            >
                <Card className="w-full border-border bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="flex justify-center mb-4"
                        >
                            <img src={logo} alt="LMS Logo" className="h-16 w-16 object-contain drop-shadow-lg" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            Welcome back
                        </CardTitle>
                        <CardDescription>
                            Choose your preferred sign in method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-11 gap-2"
                                    onClick={handleGoogleLogin}
                                >
                                    <Chrome className="h-4 w-4" />
                                    Continue with Google
                                </Button>
                            </motion.div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or
                                    </span>
                                </div>
                            </div>

                            <Tabs defaultValue="password" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="password">Password</TabsTrigger>
                                    <TabsTrigger value="magic-link">Instant Login</TabsTrigger>
                                </TabsList>

                                <TabsContent value="password">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="pl-10"
                                                    {...register('email')}
                                                />
                                            </div>
                                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                        </motion.div>
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Password</Label>
                                                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="pl-10"
                                                    {...register('password')}
                                                />
                                            </div>
                                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                                        </motion.div>

                                        {loginError && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center"
                                            >
                                                {loginError}
                                            </motion.div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                                                    </>
                                                ) : 'Sign in'}
                                            </Button>
                                        </motion.div>
                                    </form>
                                </TabsContent>

                                <TabsContent value="magic-link">
                                    <form onSubmit={handleSubmitMagic(onMagicLinkSubmit)} className="space-y-4">
                                        <motion.div
                                            className="space-y-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Label htmlFor="magic-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="magic-email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="pl-10"
                                                    {...registerMagic('email')}
                                                />
                                            </div>
                                            {errorsMagic.email && <p className="text-sm text-red-500">{errorsMagic.email.message}</p>}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Button type="submit" className="w-full h-11" disabled={isSubmittingMagic}>
                                                {isSubmittingMagic ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="mr-2 h-4 w-4" /> Send Instant Login Link
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            We'll send you a link to sign in instantly without a password.
                                        </p>
                                    </form>
                                </TabsContent>
                            </Tabs>

                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                                Create account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
