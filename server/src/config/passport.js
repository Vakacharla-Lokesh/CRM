import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";

// Local Strategy (used during login)
passport.use(
  new LocalStrategy(
    {
      usernameField: "userEmail",
      passwordField: "password",
    },
    async (userEmail, password, done) => {
      try {
        const user = await userModel.findOne({ userEmail }).select("+password");

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        if (!user.isActive) {
          return done(null, false, { message: "Account is deactivated" });
        }

        const tenant = await tenantModel.findById(user.tenantId).lean();

        if (user.role !== "super_admin" && tenant && !tenant.isActive) {
          return done(null, false, {
            message: "Organization account is deactivated",
          });
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
