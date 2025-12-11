import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

export default function () {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL_RENDER
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const name = profile.displayName;

                    let user = await User.findByEmail(email);

                    if (!user) {
                        user = await User.createGoogleUser(name, email);
                    }

                    return done(null, user);
                } catch (err) {
                    console.error("Google Auth Error:", err);
                    return done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
}
