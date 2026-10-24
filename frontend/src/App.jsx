
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Search,
  Trash2,
  Check,
  Circle,
  Pencil,
  X,
} from "lucide-react";
import "./App.css";

const INITIAL_TASKS = [
  {
    id: 1,
    title: "Learn React fundamentals",
    description: "Understand components and hooks",
    status: "Pending",
    priority: "High",
  },
  {
    id: 2,
    title: "Build Task Manager UI",
    description: "Create a clean dashboard",
    status: "Completed",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Learn Node.js",
    description: "Start learning backend development",
    status: "Pending",
    priority: "Low",
  },
];

function getSavedTasks() {
  try {
    const savedTasks = localStorage.getItem("taskflow-tasks");

    if (savedTasks !== null) {
      const parsedTasks = JSON.parse(savedTasks);

      if (Array.isArray(parsedTasks)) {
        return parsedTasks;
      }
    }
  } catch (error) {
    console.error("Could not load saved tasks:", error);
  }

  return INITIAL_TASKS;
}

function App() {
  const [tasks, setTasks] = useState(getSavedTasks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks:", error);
    }
  }, [tasks]);

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pending = tasks.length - completed;

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setEditingTaskId(null);
  }

  function addTask(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    if (editingTaskId !== null) {
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: trimmedTitle,
                description: description.trim(),
                priority,
              }
            : task
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        title: trimmedTitle,
        description: description.trim(),
        status: "Pending",
        priority,
      };

      setTasks((previousTasks) => [
        newTask,
        ...previousTasks,
      ]);
    }

    resetForm();
  }

  function editTask(task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleTask(id) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === "Completed"
                  ? "Pending"
                  : "Completed",
            }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );

    if (editingTaskId === id) {
      resetForm();
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "All" || task.status === filter;

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || "")
        .toLowerCase()
        .includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <CheckCircle2 size={25} />
          </div>
          <span>TaskFlow</span>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <div className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </div>

        <div className="nav-item">
          <ListTodo size={19} />
          <span>My Tasks</span>
        </div>

        <div className="nav-item">
          <CheckCircle2 size={19} />
          <span>Completed</span>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <strong>My Workspace</strong>
            <p>Personal account</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MY WORKSPACE</p>
            <h1>My Dashboard</h1>
          </div>

          <div className="date-label">
            <Clock size={17} />
            Stay productive today
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="welcome-tag">
              YOUR PRODUCTIVITY SPACE
            </p>
            <h2>Make today count.</h2>
            <p>
              Small steps every day lead to big results.
            </p>
          </div>

          <div className="welcome-art">
            <CheckCircle2 size={82} strokeWidth={1.2} />
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <ListTodo size={22} />
            </div>
            <p>Total Tasks</p>
            <h3>{tasks.length}</h3>
            <span>All your tasks</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock size={22} />
            </div>
            <p>Pending Tasks</p>
            <h3>{pending}</h3>
            <span>Waiting to be done</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={22} />
            </div>
            <p>Completed</p>
            <h3>{completed}</h3>
            <span>Great work!</span>
          </div>
        </section>

        <section className="task-section">
          <div className="section-heading">
            <div>
              <h2>My Tasks</h2>
              <p>Manage your daily activities</p>
            </div>

            <span className="task-count">
              {tasks.length} tasks
            </span>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <div className="form-heading">
              {editingTaskId !== null ? (
                <Pencil size={19} />
              ) : (
                <Plus size={19} />
              )}

              <h3>
                {editingTaskId !== null
                  ? "Edit your task"
                  : "Add a new task"}
              </h3>
            </div>

            <input
              type="text"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="form-footer">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                aria-label="Task priority"
              >
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
              </select>

              <div className="form-actions">
                {editingTaskId !== null && (
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={resetForm}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                )}

                <button
                  className="primary-button"
                  type="submit"
                >
                  {editingTaskId !== null ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {editingTaskId !== null
                    ? "Update Task"
                    : "Add Task"}
                </button>
              </div>
            </div>
          </form>

          <div className="task-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              {["All", "Pending", "Completed"].map((item) => (
                <button
                  key={item}
                  className={
                    filter === item
                      ? "filter active-filter"
                      : "filter"
                  }
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <ListTodo size={35} />
                <h3>No tasks found</h3>
                <p>
                  Add a task or change your search/filter.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article
                  className="task-card"
                  key={task.id}
                >
                  <button
                    className={`complete-button ${
                      task.status === "Completed"
                        ? "is-complete"
                        : ""
                    }`}
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${
                      task.status === "Completed"
                        ? "pending"
                        : "completed"
                    }`}
                    type="button"
                  >
                    {task.status === "Completed" ? (
                      <Check size={17} />
                    ) : (
                      <Circle size={21} />
                    )}
                  </button>

                  <div className="task-info">
                    <h3
                      className={
                        task.status === "Completed"
                          ? "completed-title"
                          : ""
                      }
                    >
                      {task.title}
                    </h3>

                    <p>
                      {task.description || "No description"}
                    </p>
                  </div>

                  <div className="task-badges">
                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`status-badge ${
                        task.status === "Completed"
                          ? "done"
                          : "pending"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <button
                    className="edit-button"
                    onClick={() => editTask(task)}
                    aria-label={`Edit ${task.title}`}
                    type="button"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="footer">
          Made for better days <span>♥</span> Keep moving forward.
        </footer>
      </main>
    </div>
  );
}

export default App;
