// server/config/passport.js

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userModel from "../models/userModel.js";

// ─── Local Strategy (used during login) ───────────────────────────────────────
// Validates email + password credentials
passport.use(
  new LocalStrategy(
    {
      usernameField: "userEmail", // matches your request body field
      passwordField: "password",
    },
    async (userEmail, password, done) => {
      try {
        // Find user by email and explicitly select password (it's select: false in schema)
        const user = await userModel.findOne({ userEmail }).select("+password");

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Use the comparePassword method defined on your userModel
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userModel.findById(jwtPayload.userId);

        if (!user) {
          return done(null, false);
        }

        return done(null, {
          userId: user._id,
          role: user.role,
          tenantId: jwtPayload.tenantId,
        });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
