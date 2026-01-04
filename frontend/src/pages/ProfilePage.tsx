
import { useAuth } from "@/context/AuthContext";
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

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user } = useAuth(); // We might need a way to refresh user data in context
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            password: "",
            confirmPassword: ""
        }
    });

    // Fetch fresh profile data to pre-fill form
    useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await client.get('/users/profile');
            reset({ name: res.data.name }); // Update form default values
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: ProfileFormValues) => {
            const payload: any = { name: data.name };
            if (data.password) {
                payload.password = data.password;
            }
            await client.put('/users/profile', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success("Profile updated successfully");
            // Ideally update auth context here too, but page refresh will handle it for now
        },
        onError: () => {
            toast.error("Failed to update profile");
        }
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account settings and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.role === 'student' && (
                        <div className="mb-8 p-4 bg-muted/30 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Earned Badges</h3>
                            {/* We expect badges to be in the profile response now */}
                            {/* But react-query cache might need invalidation or we assume 'profile' key includes it */}

                            {/* Wait, the current 'user' from context might not have badges. 
                                The useQuery in this component fetches '/users/profile' which NOW includes badges.
                                Let's use the data from useQuery if available.
                            */}

                            {/* Actually, let's access the query data directly */}
                            <div className="flex gap-4 flex-wrap">
                                {/* @ts-ignore */}
                                {queryClient.getQueryData(['profile'])?.badges?.length > 0 ? (
                                    // @ts-ignore
                                    Object.values(queryClient.getQueryData(['profile'])?.badges.reduce((acc: any, badge: any) => {
                                        acc[badge.type] = acc[badge.type] || { ...badge, count: 0 };
                                        acc[badge.type].count += 1;
                                        return acc;
                                    }, {})).map((badge: any) => (
                                        <BadgeDisplay key={badge.id} type={badge.type} count={badge.count} className="w-24" showName={false} />
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Complete lessons to earn badges!</p>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" value={user?.role} disabled className="uppercase bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                {...register("name")}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password (Optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Leave blank to keep current"
                                {...register("password")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
