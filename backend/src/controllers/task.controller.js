import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";

/* =========================
   CREATE TASK
========================= */
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = "medium", dueDate } =
      req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });
    }

    // ✅ Get tenant_id from project (NOT from JWT)
    const projectRes = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const tenantId = projectRes.rows[0].tenant_id;

    // ✅ Validate assigned user belongs to same tenant
    if (assignedTo) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND tenant_id = $2",
        [assignedTo, tenantId]
      );

      if (userRes.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Assigned user does not belong to this tenant",
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (
        id, project_id, tenant_id, title,
        description, priority, assigned_to, due_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, title, status, priority, created_at
      `,
      [
        uuidv4(),
        projectId,
        tenantId,
        title,
        description || null,
        priority,
        assignedTo || null,
        dueDate || null,
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create task" });
  }
};

/* =========================
   LIST PROJECT TASKS
========================= */
export const listProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId } = req.user;
    const { status, priority, assignedTo, search, page = 1, limit = 50 } =
      req.query;

    const offset = (page - 1) * limit;

    // ✅ Verify project belongs to tenant
    const projectRes = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (projectRes.rows[0].tenant_id.toString() !== tenantId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    let baseQuery = `
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
    `;

    const values = [projectId];
    let idx = 2;

    if (status) {
      baseQuery += ` AND t.status = $${idx++}`;
      values.push(status);
    }

    if (priority) {
      baseQuery += ` AND t.priority = $${idx++}`;
      values.push(priority);
    }

    if (assignedTo) {
      baseQuery += ` AND t.assigned_to = $${idx++}`;
      values.push(assignedTo);
    }

    if (search) {
      baseQuery += ` AND t.title ILIKE $${idx++}`;
      values.push(`%${search}%`);
    }

    const tasksRes = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        u.id AS assigned_user_id,
        u.full_name AS assigned_user_name,
        u.email AS assigned_user_email
      ${baseQuery}
      ORDER BY
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        t.due_date ASC NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      values
    );

    return res.status(200).json({
      success: true,
      data: {
        tasks: tasksRes.rows,
        total: Number(countRes.rows[0].count),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countRes.rows[0].count / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("LIST TASKS ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to list tasks" });
  }
};

/* =========================
   UPDATE TASK STATUS
========================= */
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const taskRes = await pool.query(
      "SELECT tenant_id FROM tasks WHERE id = $1",
      [taskId]
    );

    if (taskRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (taskRes.rows[0].tenant_id.toString() !== tenantId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at
      `,
      [status, taskId]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("UPDATE TASK STATUS ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update task status" });
  }
};

/* =========================
   DELETE TASK
========================= */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { tenantId } = req.user;

    const taskRes = await pool.query(
      "SELECT tenant_id FROM tasks WHERE id = $1",
      [taskId]
    );

    if (taskRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (taskRes.rows[0].tenant_id.toString() !== tenantId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete task" });
  }
};
