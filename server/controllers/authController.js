import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import tenantModel from "../models/tenantModel.js";

export const register = async (req, res, next) => {
  try {
    const { password, tenantName, ...userData } = req.body;

    // Check for existing user by email
    const existingUser = await userModel.findOne({
      userEmail: userData.userEmail,
    });

    console.log("existing user data: ", existingUser);

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Create tenant if tenantName is provided and no tenantId exists
    let tenantId = userData.tenantId;
    if (tenantName && !tenantId) {
      const tenant = await tenantModel.create({
        tenantName,
        email: userData.userEmail,
        mobile: userData.mobile || "0000000000",
      });
      tenantId = tenant._id;
    }

    // Ensure tenantId exists
    if (!tenantId) {
      return res.status(400).json({
        message: "Tenant information is required for registration",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      ...userData,
      tenantId,
      password,
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        user_name: `${user.firstName} ${user.lastName || ""}`.trim(),
        mobile: user.mobile,
        role: user.role,
        tenant_id: user.tenantId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { userEmail, mobile, password } = req.body;

    // Find user by email or mobile
    const user = await userModel
      .findOne({
        $or: [{ userEmail }, { mobile }],
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        user_name: `${user.firstName} ${user.lastName || ""}`.trim(),
        mobile: user.mobile,
        role: user.role,
        tenant_id: user.tenantId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Logout user (client-side token removal)
export const logout = (req, res) => {
  res.json({ message: "User logged out successfully" });
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: decoded.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.userEmail,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
