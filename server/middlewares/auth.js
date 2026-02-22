import passport from "../config/passport.js";

export const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token",
        error: info?.message || "Authentication required",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
