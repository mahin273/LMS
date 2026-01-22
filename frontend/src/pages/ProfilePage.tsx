import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Award, Camera, Mail, Lock } from "lucide-react";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().optional(),
}).refine(() => true, {});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // 1. Profile Data Query
    const { data: profileData, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await client.get('/users/profile');
            return res.data;
        }
    });

    // 2. Profile Update Form
    const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            bio: profileData?.bio || ""
        }
    });

    // 3. Password Update Form
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    // Update form default values when data loads
    useEffect(() => {
        if (profileData) {
            // @ts-ignore
            resetProfile({ name: profileData.name, bio: profileData.bio || "" });
        }
    }, [profileData, resetProfile]);

    // Mutation to update profile
    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormValues) => {
            const payload = { name: data.name, bio: data.bio };
            return client.put('/users/profile', payload); // Assuming backend accepts partial updates or ignored fields
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success("Profile updated successfully");
        },
        onError: () => {
            toast.error("Failed to update profile");
        }
    });

    // Mutation to update password
    const updatePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormValues) => {
            return client.put('/users/profile', {
                password: data.newPassword,
                currentPassword: data.currentPassword
            });
        },
        onSuccess: () => {
            toast.success("Password updated successfully");
            resetPassword();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to update password";
            toast.error(message);
        }
    });

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data);
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        updatePasswordMutation.mutate(data);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

    return (
        <div className="container mx-auto max-w-4xl py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* User Sidebar Card */}
                <Card className="w-full md:w-80 bg-card/60 backdrop-blur-xl border-border/50">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={profileData?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white h-6 w-6" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                            <Mail size={12} /> {user?.email}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase">
                                {user?.role}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <div className="flex-1 w-full">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-lg w-full justify-start mb-6">
                            <TabsTrigger value="profile" className="px-6 gap-2"><User size={16} /> Profile</TabsTrigger>
                            <TabsTrigger value="security" className="px-6 gap-2"><Shield size={16} /> Security</TabsTrigger>
                            <TabsTrigger value="badges" className="px-6 gap-2"><Award size={16} /> Badges</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your public profile details.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                {...registerProfile("name")}
                                                defaultValue={profileData?.name}
                                                className="bg-muted/30 border-muted-foreground/20"
                                            />
                                            {profileErrors.name && <p className="text-red-500 text-sm">{profileErrors.name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={user?.email}
                                                disabled
                                                className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                                            />
                                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                {...registerProfile("bio")}
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-muted/30 border-muted-foreground/20"
                                                placeholder="Tell us a little about yourself"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={updateProfileMutation.isPending}>
                                                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>Ensure your account is secure by setting a strong password.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    {...registerPassword("currentPassword")}
                                                    className="pl-10 bg-muted/30 border-muted-foreground/20"
                                                />
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            </div>
                                            {passwordErrors.currentPassword && <p className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</p>}
                                        </div>

                                        <Separator className="my-2 bg-border/50" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    {...registerPassword("newPassword")}
                                                    className="bg-muted/30 border-muted-foreground/20"
                                                />
                                                {passwordErrors.newPassword && <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    {...registerPassword("confirmPassword")}
                                                    className="bg-muted/30 border-muted-foreground/20"
                                                />
                                                {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" variant="destructive" disabled={updatePasswordMutation.isPending}>
                                                {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="badges" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                                <CardHeader>
                                    <CardTitle>Achievements</CardTitle>
                                    <CardDescription>Badges earned through course completion.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-6 flex-wrap justify-center md:justify-start">
                                        {profileData?.badges && profileData.badges.length > 0 ? (
                                            Object.values(profileData.badges.reduce((acc: any, badge: any) => {
                                                acc[badge.type] = acc[badge.type] || { ...badge, count: 0 };
                                                acc[badge.type].count += 1;
                                                return acc;
                                            }, {})).map((badge: any) => (
                                                <div key={badge.id} className="flex flex-col items-center gap-2 transition-transform hover:scale-110 duration-300 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/10 border border-white/5 shadow-lg">
                                                    <BadgeDisplay type={badge.type} count={badge.count} className="w-32 h-32" showName={false} />
                                                    <span className="font-semibold capitalize mt-2 text-foreground/80">{badge.type.replace('_', ' ')}</span>
                                                    <span className="text-xs text-muted-foreground">x{badge.count} Earned</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center w-full py-12 flex flex-col items-center gap-4 text-muted-foreground">
                                                <Award className="h-16 w-16 opacity-20" />
                                                <p>No badges earned yet. Complete lessons to unlock achievements!</p>
                                                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
