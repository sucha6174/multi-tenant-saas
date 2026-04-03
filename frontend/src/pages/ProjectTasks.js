import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function ProjectTasks() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const tenantId = currentUser?.tenantId;

  // ---------------- LOAD TASKS ----------------
  const loadTasks = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);

      console.log("TASK API RAW RESPONSE:", res.data);

      // ✅ HANDLE BOTH POSSIBLE BACKEND SHAPES
      let taskList = [];

      if (Array.isArray(res.data.data)) {
        taskList = res.data.data;
      } else if (Array.isArray(res.data.data?.tasks)) {
        taskList = res.data.data.tasks;
      }

      setTasks(taskList);
    } catch (err) {
      console.error("Load tasks error", err);
      setTasks([]); // safety fallback
    }
  };

  // ---------------- LOAD USERS ----------------
  const loadUsers = async () => {
    try {
      const res = await api.get(`/tenants/${tenantId}/users`);

      console.log("USERS API RAW RESPONSE:", res.data);

      let userList = [];

      if (Array.isArray(res.data.data)) {
        userList = res.data.data;
      } else if (Array.isArray(res.data.data?.users)) {
        userList = res.data.data.users;
      }

      setUsers(userList);
    } catch (err) {
      console.error("Load users error", err);
      setUsers([]);
    }
  };

  // ---------------- CREATE TASK ----------------
  const createTask = async () => {
    if (!title.trim()) {
      alert("Enter task title");
      return;
    }

    try {
      await api.post(`/projects/${projectId}/tasks`, { title });
      setTitle("");
      loadTasks();
    } catch (err) {
      console.error("Create task error", err);
    }
  };

  // ---------------- UPDATE STATUS ----------------
  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (err) {
      console.error("Update status error", err);
    }
  };

  // ---------------- ASSIGN USER ----------------
  const assignUser = async (taskId, userId) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        assignedTo: userId || null,
      });
      loadTasks();
    } catch (err) {
      console.error("Assign user error", err);
    }
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [projectId]);

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 20 }}>
      <h2>Tasks</h2>

      {/* CREATE TASK */}
      <input
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={createTask}>Add Task</button>

      <hr />

      {/* TASK LIST */}
      {!Array.isArray(tasks) || tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: 20 }}>
              <strong>{task.title}</strong> — {task.status}

              <br />

              {/* STATUS */}
              <button onClick={() => updateStatus(task.id, "todo")}>
                Todo
              </button>
              <button onClick={() => updateStatus(task.id, "in_progress")}>
                In Progress
              </button>
              <button onClick={() => updateStatus(task.id, "completed")}>
                Completed
              </button>

              <br />

              {/* ASSIGN USER */}
              <select
                value={task.assigned_to || ""}
                onChange={(e) => assignUser(task.id, e.target.value)}
              >
                <option value="">Unassigned</option>

                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
