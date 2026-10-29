import { useState, useEffect, useRef } from "react";
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
  Loader2,
  AlertCircle,
  XCircle,
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

const TITLE_MIN = 3;
const TITLE_MAX = 60;
const DESC_MAX = 200;

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

/* ---------- Validation ---------- */
function validateForm({ title, description }, tasks, editingTaskId) {
  const errors = {};
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    errors.title = "Task title is required.";
  } else if (trimmedTitle.length < TITLE_MIN) {
    errors.title = `Title must be at least ${TITLE_MIN} characters.`;
  } else if (trimmedTitle.length > TITLE_MAX) {
    errors.title = `Title can't be longer than ${TITLE_MAX} characters.`;
  } else {
    const duplicate = tasks.some(
      (task) =>
        task.id !== editingTaskId &&
        task.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (duplicate) {
      errors.title = "A task with this title already exists.";
    }
  }

  if (description.trim().length > DESC_MAX) {
    errors.description = `Description can't be longer than ${DESC_MAX} characters.`;
  }

  return errors;
}

function App() {
  const [tasks, setTasks] = useState(getSavedTasks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");

  // New: validation, loading and feedback state
  const [touched, setTouched] = useState({ title: false, description: false });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const titleInputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Initial loading skeleton (short, so the UI never "pops" in)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks:", error);
    }
  }, [tasks]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(toastTimerRef.current);
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  function showToast(message, type = "success") {
    clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  const completed = tasks.filter((task) => task.status === "Completed").length;
  const pending = tasks.length - completed;

  const errors = validateForm({ title, description }, tasks, editingTaskId);
  const showTitleError = (touched.title || submitted) && errors.title;
  const showDescError = (touched.description || submitted) && errors.description;

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setEditingTaskId(null);
    setTouched({ title: false, description: false });
    setSubmitted(false);
  }

  function addTask(e) {
    e.preventDefault();
    if (isSaving) return;

    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      titleInputRef.current?.focus();
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const wasEditing = editingTaskId !== null;

    setIsSaving(true);

    // Small delay gives the user visible "Saving..." feedback.
    // Replace this with your real API call later.
    saveTimerRef.current = setTimeout(() => {
      if (wasEditing) {
        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task.id === editingTaskId
              ? {
                  ...task,
                  title: trimmedTitle,
                  description: trimmedDescription,
                  priority,
                }
              : task
          )
        );
      } else {
        const newTask = {
          id: Date.now(),
          title: trimmedTitle,
          description: trimmedDescription,
          status: "Pending",
          priority,
        };

        setTasks((previousTasks) => [newTask, ...previousTasks]);
      }

      resetForm();
      setIsSaving(false);
      showToast(wasEditing ? "Task updated successfully." : "Task added successfully.");
    }, 450);
  }

  
  function editTask(task) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setTouched({ title: false, description: false });
    setSubmitted(false);
    setActivePage("Dashboard");
    setFilter("All");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => titleInputRef.current?.focus(), 300);
  }

  function toggleTask(id) {
    const target = tasks.find((task) => task.id === id);
    const nowCompleted = target?.status !== "Completed";

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Completed" ? "Pending" : "Completed",
            }
          : task
      )
    );

    showToast(nowCompleted ? "Nice! Task completed." : "Task moved back to pending.");
  }

  function deleteTask(id) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );

    if (editingTaskId === id) {
      resetForm();
    }

    showToast("Task deleted.", "info");
  }

  function navigateTo(page) {
    setActivePage(page);
    setSearch("");

    if (page === "Dashboard") {
      setFilter("All");
    } else if (page === "My Tasks") {
      setFilter("Pending");
    } else {
      setFilter("Completed");
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || "").toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  /* ---------- Empty state content ---------- */
  function renderEmptyState() {
    let heading = "No tasks found";
    let text = "Add a task or change your search/filter.";
    let action = null;

    if (tasks.length === 0) {
      heading = "No tasks yet";
      text = "Add your first task to get started.";
      if (activePage !== "Completed") {
        action = (
          <button
            type="button"
            className="primary-button empty-action"
            onClick={() => titleInputRef.current?.focus()}
          >
            <Plus size={17} />
            Add your first task
          </button>
        );
      }
    } else if (search.trim()) {
      heading = "No matching tasks";
      text = `Nothing found for "${search.trim()}".`;
      action = (
        <button
          type="button"
          className="ghost-button empty-action"
          onClick={() => setSearch("")}
        >
          <X size={16} />
          Clear search
        </button>
      );
    } else if (filter === "Completed") {
      heading = "No completed tasks yet";
      text = "Finish a task and it will show up here.";
    } else if (filter === "Pending") {
      heading = "All caught up!";
      text = "You have no pending tasks. Enjoy your day.";
    }

    return (
      <div className="empty-state">
        <ListTodo size={35} />
        <h3>{heading}</h3>
        <p>{text}</p>
        {action}
      </div>
    );
  }

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

        <button
          type="button"
          className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
          onClick={() => navigateTo("Dashboard")}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activePage === "My Tasks" ? "active" : ""}`}
          onClick={() => navigateTo("My Tasks")}
        >
          <ListTodo size={19} />
          <span>My Tasks</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activePage === "Completed" ? "active" : ""}`}
          onClick={() => navigateTo("Completed")}
        >
          <CheckCircle2 size={19} />
          <span>Completed</span>
        </button>

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
            <h1>{activePage === "Dashboard" ? "My Dashboard" : activePage}</h1>
          </div>

          <div className="date-label">
            <Clock size={17} />
            Stay productive today
          </div>
        </header>

        {activePage === "Dashboard" && (
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
        )}

        {activePage === "Dashboard" && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                <ListTodo size={22} />
              </div>
              <p>Total Tasks</p>
              <h3>{isLoading ? <span className="skeleton skeleton-num" /> : tasks.length}</h3>
              <span>All your tasks</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Clock size={22} />
              </div>
              <p>Pending Tasks</p>
              <h3>{isLoading ? <span className="skeleton skeleton-num" /> : pending}</h3>
              <span>Waiting to be done</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle2 size={22} />
              </div>
              <p>Completed</p>
              <h3>{isLoading ? <span className="skeleton skeleton-num" /> : completed}</h3>
              <span>Great work!</span>
            </div>
          </section>
        )}

        <section className="task-section">
          <div className="section-heading">
            <div>
              <h2>{activePage === "Dashboard" ? "My Tasks" : activePage}</h2>
              <p>
                {activePage === "Completed"
                  ? "Tasks you have finished"
                  : activePage === "My Tasks"
                    ? "Tasks waiting to be completed"
                    : "Manage your daily activities"}
              </p>
            </div>

            <span className="task-count">
              {isLoading ? "…" : `${filteredTasks.length} tasks`}
            </span>
          </div>

          {activePage !== "Completed" && (
            <form className="add-task-form" onSubmit={addTask} noValidate>
              <div className="form-heading">
                {editingTaskId !== null ? <Pencil size={19} /> : <Plus size={19} />}

                <h3>{editingTaskId !== null ? "Edit your task" : "Add a new task"}</h3>
              </div>

              <div className="field">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="What do you need to do?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                  className={showTitleError ? "has-error" : ""}
                  aria-invalid={Boolean(showTitleError)}
                  aria-describedby={showTitleError ? "title-error" : undefined}
                  maxLength={TITLE_MAX + 20}
                  disabled={isSaving}
                />
                <div className="field-meta">
                  {showTitleError ? (
                    <p className="field-error" id="title-error" role="alert">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`char-count ${
                      title.trim().length > TITLE_MAX ? "over" : ""
                    }`}
                  >
                    {title.trim().length}/{TITLE_MAX}
                  </span>
                </div>
              </div>

              <div className="field">
                <textarea
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                  className={showDescError ? "has-error" : ""}
                  aria-invalid={Boolean(showDescError)}
                  aria-describedby={showDescError ? "desc-error" : undefined}
                  rows={2}
                  disabled={isSaving}
                />
                <div className="field-meta">
                  {showDescError ? (
                    <p className="field-error" id="desc-error" role="alert">
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`char-count ${
                      description.trim().length > DESC_MAX ? "over" : ""
                    }`}
                  >
                    {description.trim().length}/{DESC_MAX}
                  </span>
                </div>
              </div>

              <div className="form-footer">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  aria-label="Task priority"
                  disabled={isSaving}
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
                      disabled={isSaving}
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  )}

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 size={17} className="spin" />
                    ) : editingTaskId !== null ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={17} />
                    )}

                    {isSaving
                      ? "Saving..."
                      : editingTaskId !== null
                        ? "Update Task"
                        : "Add Task"}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="task-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search tasks"
              />
            </div>

            {activePage === "Dashboard" && (
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
            )}
          </div>

          <div className="task-list" aria-busy={isLoading}>
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div className="task-card skeleton-card" key={n} aria-hidden="true">
                  <span className="skeleton skeleton-circle" />
                  <div className="task-info">
                    <span className="skeleton skeleton-line" />
                    <span className="skeleton skeleton-line short" />
                  </div>
                  <span className="skeleton skeleton-pill" />
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              renderEmptyState()
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
                    <span className={`priority-badge ${task.priority.toLowerCase()}`}>
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

                  <div className="task-actions">
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
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="footer">
          Made for better days <span>♥</span> Keep moving forward.
        </footer>
      </main>


      {/* Toast feedback */}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className={`toast toast-${toast.type}`} key={toast.id}>
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <XCircle size={18} />}
            {toast.type === "info" && <Trash2 size={18} />}
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >

              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;