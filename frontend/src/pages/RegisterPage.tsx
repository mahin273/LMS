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


const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['student', 'instructor']),
})

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const navigate = useNavigate()
    const { refetchUser } = useAuth()
    const [error, setError] = useState('')
    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'student'
        }
    })

    // Watch role for manual select handling if using Shadcn Select
    const role = watch('role');

    const [successMessage, setSuccessMessage] = useState('')

    const onSubmit = async (data: FormData) => {
        try {
            setError('')
            setSuccessMessage('')
            const res = await client.post('/auth/register', data)

            if (res.data.token) {
                setToken(res.data.token)
                await refetchUser()
                navigate('/dashboard')
            } else if (res.data.message) {
                setSuccessMessage(res.data.message)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed')
        }
    }

    // Simplified Select for speed if component missing, otherwise standard HTML select or implement Select
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription>
                        Create an account to start learning.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" {...register('name')} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">I am a</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('role')}
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {successMessage && (
                            <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm text-center">
                                {successMessage}
                            </div>
                        )}

                        {!successMessage && (
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'Create account'}
                            </Button>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
                </CardFooter>
            </Card>
        </div>
    )
}
