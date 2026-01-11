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

    return (
        <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
            </div>

            <Card className="w-full max-w-md border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Lock className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        Welcome back
                    </CardTitle>
                    <CardDescription>
                        Choose your preferred sign in method
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all gap-2"
                            onClick={handleGoogleLogin}
                        >
                            <Chrome className="h-4 w-4" />
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background/20 backdrop-blur-xl px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>

                        <Tabs defaultValue="password" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5">
                                <TabsTrigger value="password">Password</TabsTrigger>
                                <TabsTrigger value="magic-link">Instant Login</TabsTrigger>
                            </TabsList>

                            <TabsContent value="password">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all"
                                                {...register('email')}
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link to="#" className="text-sm text-primary hover:text-primary/80 hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all"
                                                {...register('password')}
                                            />
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                                    </div>

                                    {loginError && (
                                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
                                            {loginError}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                                            </>
                                        ) : 'Sign in'}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="magic-link">
                                <form onSubmit={handleSubmitMagic(onMagicLinkSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="magic-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="magic-email"
                                                type="email"
                                                placeholder="name@example.com"
                                                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all"
                                                {...registerMagic('email')}
                                            />
                                        </div>
                                        {errorsMagic.email && <p className="text-sm text-red-500">{errorsMagic.email.message}</p>}
                                    </div>
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
        </div>
    )
}
