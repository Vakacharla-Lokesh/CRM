import envConfig from "./envConfig.js";

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userModel from "../modules/users/models/userModel.js";
import tenantModel from "../modules/tenants/models/tenantModel.js";

// Local Strategy (used during login)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await userModel.findOne({ email }).select("+password");

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
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.auth_token ?? null,
      ]),
      secretOrKey: envConfig.jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await userModel.findById(jwtPayload.userId).lean();
        if (!user) return done(null, false);

        let permissions = [];
        if (user.permissions && typeof user.permissions === "object") {
          try {
            permissions = Object.entries(user.permissions)
              .filter(([, v]) => v === true)
              .map(([k]) => k);
          } catch (err) {
            console.error("Error processing permissions in passport:", err);
          }
        }

        return done(null, {
          userId: user._id,
          role: user.role,
          tenantId: user.tenantId,
          permissions,
        });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
