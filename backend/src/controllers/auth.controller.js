import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

/**
 * Generate JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password || !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Email, password and tenant subdomain are required",
      });
    }

    // 1️⃣ Get tenant
    const tenantResult = await pool.query(
      "SELECT * FROM tenants WHERE subdomain = $1",
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active",
      });
    }

    // 2️⃣ Get user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND tenant_id = $2",
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Generate token
    const token = generateToken(user);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET CURRENT USER
 */
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: req.user,
  });
};
