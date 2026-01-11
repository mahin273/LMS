import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists by googleId
                let user = await User.findOne({ where: { googleId: profile.id } });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists by email
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found from Google profile'));
                }

                user = await User.findOne({ where: { email } });

                if (user) {
                    // Link googleId to existing user
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    email,
                    name: profile.displayName,
                    role: 'student', // Default role
                    status: 'active',
                } as any);

                return done(null, user);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
);

export default passport;
