import pool from "../config/db.js";

/**
 * CREATE PROJECT
 */
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { tenantId, userId } = req.user;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Check project limit
    const tenantResult = await pool.query(
      "SELECT max_projects FROM tenants WHERE id = $1",
      [tenantId]
    );

    const projectCountResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    if (
      Number(projectCountResult.rows[0].count) >=
      tenantResult.rows[0].max_projects
    ) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached for subscription plan",
      });
    }

    // Create project
    const result = await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [tenantId, name, description, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * LIST PROJECTS  ✅ FIXED
 */
export const listProjects = async (req, res) => {
  try {
    const { tenantId, role } = req.user;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.full_name AS created_by
      FROM projects p
      JOIN users u ON u.id = p.created_by
    `;

    const values = [];

    // 🔐 Tenant isolation
    if (role !== "super_admin") {
      query += ` WHERE p.tenant_id = $1`;
      values.push(tenantId);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: {
        projects: result.rows,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

/**
 * UPDATE PROJECT
 */
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId } = req.user;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [name, description, status, projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE PROJECT
 */
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId } = req.user;

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id",
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
