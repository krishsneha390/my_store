import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

export default function configurePassport() {
  const isRender = process.env.RENDER === "true";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        // AUTO SWITCH BETWEEN LOCAL + RENDER URL
        callbackURL: isRender
          ? process.env.GOOGLE_CALLBACK_URL_RENDER
          : process.env.GOOGLE_CALLBACK_URL,

        passReqToCallback: false, // you don’t need req for login
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || "Google User";

          if (!email) {
            console.error("Google account has no email");
            return done(null, false);
          }

          let user = await User.findByEmail(email);

          if (!user) {
            user = await User.create(name, email, null, "google");
          }

          return done(null, user);
        } catch (err) {
          console.error("Google Strategy Error:", err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
