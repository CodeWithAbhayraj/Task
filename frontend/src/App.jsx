
import { useState } from "react";
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
} from "lucide-react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([
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
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pending = tasks.length - completed;

  function addTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: "Pending",
      priority,
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDescription("");
    setPriority("Medium");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) =>
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
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "All" || task.status === filter;

    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

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
            <p className="welcome-tag">YOUR PRODUCTIVITY SPACE</p>
            <h2>Make today count.</h2>
            <p>Small steps every day lead to big results.</p>
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
            <span className="task-count">{tasks.length} tasks</span>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <div className="form-heading">
              <Plus size={19} />
              <h3>Add a new task</h3>
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
              rows="2"
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

              <button className="primary-button" type="submit">
                <Plus size={17} />
                Add Task
              </button>
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
                  className={filter === item ? "filter active-filter" : "filter"}
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
                <p>Add a task or change your search/filter.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <button
                    className={`complete-button ${
                      task.status === "Completed" ? "is-complete" : ""
                    }`}
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${
                      task.status === "Completed" ? "pending" : "completed"
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
                        task.status === "Completed" ? "completed-title" : ""
                      }
                    >
                      {task.title}
                    </h3>
                    <p>{task.description || "No description"}</p>
                  </div>

                  <div className="task-badges">
                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`status-badge ${
                        task.status === "Completed" ? "done" : "pending"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

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
