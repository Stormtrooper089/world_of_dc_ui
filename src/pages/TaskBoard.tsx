import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Department, getDepartmentLabel } from "../constants/enums";
import { useAuth } from "../contexts/AuthContext";
import { taskService } from "../services/taskService";
import { officerService } from "../services/officerService";
import {
  CreateTaskInput,
  Task,
  TaskAssignee,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from "../types/taskTypes";

const STATUS_STYLES: Record<TaskStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700",
  DONE: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  URGENT: "bg-red-200 text-red-800",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

type ToastState = { message: string; type: "success" | "error" | "info" } | null;

type ActiveFilters = {
  status: TaskStatus[];
  priority: TaskPriority[];
  department: Department[];
  officer: string[];
  dueStart: string;
  dueEnd: string;
};

const defaultFilters: ActiveFilters = {
  status: [],
  priority: [],
  department: [],
  officer: [],
  dueStart: "",
  dueEnd: "",
};

type FilterOption = { value: string; label: string };

const MultiSelectFilterMenu = ({
  label,
  options,
  selected,
  onChange,
  emptyText = "All",
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const summaryText = selected.length === 0
    ? emptyText
    : selected.length === 1
      ? (options.find((option) => option.value === selected[0])?.label || "1 selected")
      : `${selected.length} selected`;

  const toggleValue = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="relative" ref={rootRef}>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-left text-sm px-2.5 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none flex items-center justify-between"
      >
        <span className="truncate text-gray-700">{summaryText}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg p-1.5 space-y-1">
          {options.length === 0 && <p className="px-2 py-1 text-xs text-gray-400">No options</p>}
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleValue(option.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, hint }: { title: string; value: number; hint: string }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500 min-w-[150px]">
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
    <div className="flex items-end justify-between mt-1">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <span className="text-xs text-gray-400">{hint}</span>
    </div>
  </div>
);

const Toast = ({
  toast,
  onClose,
}: {
  toast: NonNullable<ToastState>;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[60] min-w-[320px] max-w-md p-4 rounded-lg border-2 shadow-lg flex items-start gap-3 ${styles[toast.type]}`}
    >
      {toast.type === "error" ? (
        <AlertCircle className="w-5 h-5 text-red-600" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-600" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};



const CreateTaskModal = ({
  userId,
  userName,
  assignees,
  onClose,
  onCreated,
  onToast,
}: {
  userId: string;
  userName: string;
  assignees: TaskAssignee[];
  onClose: () => void;
  onCreated: (task: Task) => void;
  onToast: (message: string, type: "success" | "error" | "info") => void;
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: Department.UNASSIGNED,
    priority: "MEDIUM" as TaskPriority,
    assignedToId: userId,
    assignedToName: userName,
    dueDate: "",
  });

  const availableAssignees = useMemo(() => {
    const filtered = assignees.filter((item) => item.department === form.department);
    const self = { id: userId, name: userName, department: form.department };
    const hasSelf = filtered.some((a) => a.id === userId);
    return hasSelf ? filtered : [self, ...filtered];
  }, [assignees, form.department, userId, userName]);

  useEffect(() => {
    if (availableAssignees.length === 0) {
      setForm((prev) => ({ ...prev, assignedToId: "", assignedToName: "" }));
      return;
    }
    const stillValid = availableAssignees.some((a) => a.id === form.assignedToId);
    if (!stillValid) {
      const first = availableAssignees[0];
      setForm((prev) => ({ ...prev, assignedToId: first.id, assignedToName: first.name }));
    }
  }, [availableAssignees]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      onToast("Title and description are required", "error");
      return;
    }

    if (!form.assignedToId) {
      onToast("Please select an assignee", "error");
      return;
    }

    const payload: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      department: form.department,
      scope: form.assignedToId === userId ? "SELF" : "DEPARTMENT",
      priority: form.priority,
      assignedToId: form.assignedToId || undefined,
      assignedToName: form.assignedToName || undefined,
      dueDate: form.dueDate || undefined,
      createdById: userId,
      createdByName: userName,
    };

    setSaving(true);
    try {
      const created = await taskService.createTask(payload);
      onCreated(created);
      onToast("Task created successfully", "success");
    } catch (_error) {
      onToast("Failed to create task", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Task</h2>
            <p className="text-xs text-gray-500">Assign to yourself or your department.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Title</label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Write task details"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Department</label>
              <select
                value={form.department}
                onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value as Department }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(Department).map((dept) => (
                  <option key={dept} value={dept}>
                    {getDepartmentLabel(dept)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Priority</label>
              <select
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">Assignee</label>
              <select
                value={form.assignedToId}
                onChange={(event) => {
                  const selected = availableAssignees.find((officer) => officer.id === event.target.value);
                  setForm((prev) => ({
                    ...prev,
                    assignedToId: event.target.value,
                    assignedToName: selected?.name || "",
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {availableAssignees.length === 0 && <option value="">No officer available</option>}
                {availableAssignees.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Creating" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TaskBoard() {
  const { user } = useAuth();
  const userId = user?.id || "off-local";
  const userName = user?.name || "Current Officer";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignees, setAssignees] = useState<TaskAssignee[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tempChanges, setTempChanges] = useState<Partial<Task>>({});
  const [commentText, setCommentText] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const mergeTask = (incoming: Task) => {
    setTasks((prev) => prev.map((item) => (item.id === incoming.id ? incoming : item)));
  };

  const refreshTaskDetail = async (taskId: string): Promise<Task | null> => {
    try {
      const [task, workflow] = await Promise.all([
        taskService.getTaskById(taskId),
        taskService.getWorkflow(taskId),
      ]);

      if (!task) return null;

      const enrichedTask: Task = {
        ...task,
        activity: workflow.length > 0 ? workflow : task.activity,
      };
      mergeTask(enrichedTask);
      return enrichedTask;
    } catch (_error) {
      showToast("Failed to refresh task details", "error");
      return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskData, overdueData, officerData] = await Promise.all([
        taskService.getTasks(),
        taskService.getOverdueTasks(),
        officerService.getAllOfficers(),
      ]);

      // Build assignee list: start from task-derived officers, then merge in all real officers
      const taskDerived = taskService.getAssignableOfficers(taskData, {
        id: userId,
        name: userName,
        department: Department.UNASSIGNED,
      });
      const merged = new Map<string, TaskAssignee>();
      taskDerived.forEach((a) => merged.set(a.id, a));
      officerData.forEach((o) => {
        if (!merged.has(o.id)) {
          merged.set(o.id, { id: o.id, name: o.name, department: o.department as Department });
        }
      });
      // Always include current user
      if (!merged.has(userId)) {
        merged.set(userId, { id: userId, name: userName, department: Department.UNASSIGNED });
      }

      setTasks(taskData);
      setOverdueCount(overdueData.length);
      setAssignees([...merged.values()]);
    } catch (_error) {
      showToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, userName]);

  // No facets needed — filters use single-select dropdowns

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.taskNumber.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
      const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
      const matchesDept = filters.department.length === 0 || filters.department.includes(task.department);
      const matchesOfficer = filters.officer.length === 0 || filters.officer.includes(task.assignedToId || "");

      let matchesDueDate = true;
      if (filters.dueStart && task.dueDate) {
        matchesDueDate = new Date(task.dueDate) >= new Date(filters.dueStart);
      }
      if (filters.dueEnd && task.dueDate && matchesDueDate) {
        const end = new Date(filters.dueEnd);
        end.setHours(23, 59, 59, 999);
        matchesDueDate = new Date(task.dueDate) <= end;
      }

      return (
        matchesQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesDept &&
        matchesOfficer &&
        matchesDueDate
      );
    });
  }, [tasks, searchQuery, filters]);

  const stats = useMemo(() => {
    const overdue = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.status !== "DONE" && new Date(task.dueDate).getTime() < Date.now();
    }).length;

    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status === "OPEN").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      done: tasks.filter((task) => task.status === "DONE").length,
      overdue: overdueCount || overdue,
    };
  }, [overdueCount, tasks]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    const task = tasks.find((item) => item.id === selectedTaskId);
    return task ? { ...task, ...tempChanges } : null;
  }, [tasks, selectedTaskId, tempChanges]);



  const handleSave = async () => {
    if (!selectedTaskId || Object.keys(tempChanges).length === 0) return;

    setSaving(true);
    try {
      const existingTask = tasks.find((item) => item.id === selectedTaskId);
      if (!existingTask) {
        showToast("Task not found", "error");
        return;
      }

      if (
        typeof tempChanges.status !== "undefined" &&
        tempChanges.status !== existingTask.status
      ) {
        const statusUpdated = await taskService.updateTaskStatus(selectedTaskId, tempChanges.status);
        mergeTask(statusUpdated);
      }

      if (
        "assignedToId" in tempChanges &&
        tempChanges.assignedToId !== existingTask.assignedToId
      ) {
        const assignmentUpdated = await taskService.assignTask(selectedTaskId, tempChanges.assignedToId);
        mergeTask(assignmentUpdated);
      }

      const patchPayload: Partial<UpdateTaskInput> = {
        updatedByName: userName,
      };

      if (typeof tempChanges.title !== "undefined") patchPayload.title = tempChanges.title;
      if (typeof tempChanges.description !== "undefined") patchPayload.description = tempChanges.description;
      if (typeof tempChanges.priority !== "undefined") patchPayload.priority = tempChanges.priority;
      if (typeof tempChanges.department !== "undefined") patchPayload.department = tempChanges.department;
      if (typeof tempChanges.scope !== "undefined") patchPayload.scope = tempChanges.scope;
      if (typeof tempChanges.dueDate !== "undefined") patchPayload.dueDate = tempChanges.dueDate;
      if (typeof tempChanges.tags !== "undefined") patchPayload.tags = tempChanges.tags;

      if (Object.keys(patchPayload).length > 1) {
        const patched = await taskService.patchTask(selectedTaskId, patchPayload);
        mergeTask(patched);
      }

      await refreshTaskDetail(selectedTaskId);
      setTempChanges({});
      showToast("Task updated", "success");
    } catch (_error) {
      showToast("Failed to update task", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTaskId || !commentText.trim()) {
      showToast("Please write a comment", "error");
      return;
    }

    setAddingComment(true);
    try {
      await taskService.addComment(selectedTaskId, {
        message: commentText.trim(),
        authorId: userId,
        authorName: userName,
      });
      await refreshTaskDetail(selectedTaskId);
      setCommentText("");
      showToast("Comment added", "success");
    } catch (_error) {
      showToast("Failed to add comment", "error");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;

    const approved = window.confirm("Delete this task? This action cannot be undone.");
    if (!approved) return;

    setSaving(true);
    try {
      await taskService.deleteTask(selectedTaskId);
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));
      setSelectedTaskId(null);
      setTempChanges({});
      showToast("Task deleted", "success");
      await loadData();
    } catch (_error) {
      showToast("Failed to delete task", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TB</div>
          <h1 className="font-semibold text-gray-800">Task Board</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks by title, number, description"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </header>

      <div className="px-6 py-4 grid grid-cols-5 gap-4 shrink-0">
        <MetricCard title="Total" value={stats.total} hint="All" />
        <MetricCard title="Open" value={stats.open} hint="Queued" />
        <MetricCard title="In Progress" value={stats.inProgress} hint="Active" />
        <MetricCard title="Done" value={stats.done} hint="Completed" />
        <MetricCard title="Overdue" value={stats.overdue} hint="Needs action" />
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4 mt-2">
        {showFilters && (
          <aside className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => {
                  setFilters(defaultFilters);
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <MultiSelectFilterMenu
                  label="Status"
                  emptyText="All statuses"
                  selected={filters.status}
                  onChange={(next) => setFilters((prev) => ({ ...prev, status: next as TaskStatus[] }))}
                  options={(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
                    value: status,
                    label: STATUS_LABELS[status],
                  }))}
                />
              </div>

              <div>
                <MultiSelectFilterMenu
                  label="Priority"
                  emptyText="All priorities"
                  selected={filters.priority}
                  onChange={(next) => setFilters((prev) => ({ ...prev, priority: next as TaskPriority[] }))}
                  options={(Object.keys(PRIORITY_STYLES) as TaskPriority[]).map((priority) => ({
                    value: priority,
                    label: priority.charAt(0) + priority.slice(1).toLowerCase(),
                  }))}
                />
              </div>

              <div>
                <MultiSelectFilterMenu
                  label="Department"
                  emptyText="All departments"
                  selected={filters.department}
                  onChange={(next) => setFilters((prev) => ({ ...prev, department: next as Department[] }))}
                  options={Object.values(Department).map((department) => ({
                    value: department,
                    label: getDepartmentLabel(department),
                  }))}
                />
              </div>

              <div>
                <MultiSelectFilterMenu
                  label="Officer"
                  emptyText="All officers"
                  selected={filters.officer}
                  onChange={(next) => setFilters((prev) => ({ ...prev, officer: next }))}
                  options={assignees.map((assignee) => ({ value: assignee.id, label: assignee.name }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Due Date From
                </label>
                <input
                  type="date"
                  className="w-full text-sm px-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filters.dueStart}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dueStart: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Due Date To</label>
                <input
                  type="date"
                  className="w-full text-sm px-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filters.dueEnd}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dueEnd: e.target.value }))}
                />
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`p-2 rounded hover:bg-gray-100 ${showFilters ? "text-blue-600" : "text-gray-400"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={loadData}
                className="p-2 rounded hover:bg-gray-100 text-gray-500"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500 font-medium pl-2 border-l border-gray-200">
                Showing {filteredTasks.length} tasks
              </span>
            </div>
          </div>

          <div className="overflow-auto flex-1">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading tasks...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[110px]">Task</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[110px]">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[180px]">Assignee</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={async () => {
                        setSelectedTaskId(task.id);
                        setTempChanges({});
                        await refreshTaskDetail(task.id);
                      }}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors group ${
                        selectedTaskId === task.id ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 group-hover:text-blue-600 font-medium">{task.taskNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{task.title}</p>
                        <p className="text-[11px] text-gray-500 truncate max-w-[300px]">{getDepartmentLabel(task.department)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{task.assignedToName || "Unassigned"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50/80">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold text-gray-500">{selectedTask.taskNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY_STYLES[selectedTask.priority]}`}>
                      {selectedTask.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[selectedTask.status]}`}>
                      {STATUS_LABELS[selectedTask.status]}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteTask}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-70"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(tempChanges).length === 0}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving" : "Save"}
                  </button>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                      <textarea
                        rows={6}
                        value={selectedTask.description}
                        onChange={(event) => setTempChanges((prev) => ({ ...prev, description: event.target.value }))}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Department</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {getDepartmentLabel(selectedTask.department)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Assignee</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                            <User className="w-4 h-4 text-gray-400" />
                            {selectedTask.assignedToName || "Unassigned"}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Created</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(selectedTask.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Due Date</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "No due date"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Comments</h3>
                      <div className="relative mt-2">
                        <textarea
                          rows={3}
                          value={commentText}
                          onChange={(event) => setCommentText(event.target.value)}
                          placeholder="Add progress note..."
                          className="w-full text-sm pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={addingComment || !commentText.trim()}
                          className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          title="Add comment"
                        >
                          {addingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="space-y-4 mt-5 max-h-[300px] overflow-y-auto pr-1">
                        {selectedTask.comments.length === 0 && (
                          <div className="text-center py-6 text-xs text-gray-400">No comments yet</div>
                        )}
                        {selectedTask.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 border border-blue-200">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs font-bold text-gray-900">{comment.authorName}</span>
                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{comment.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-5 sticky top-6">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Title</label>
                        <input
                          value={selectedTask.title}
                          onChange={(event) => setTempChanges((prev) => ({ ...prev, title: event.target.value }))}
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
                        <select
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={selectedTask.status}
                          onChange={(event) => setTempChanges((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
                        >
                          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Priority</label>
                        <select
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={selectedTask.priority}
                          onChange={(event) => setTempChanges((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                        >
                          {(Object.keys(PRIORITY_STYLES) as TaskPriority[]).map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Department</label>
                        <select
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={selectedTask.department}
                          onChange={(event) => setTempChanges((prev) => ({ ...prev, department: event.target.value as Department }))}
                        >
                          {Object.values(Department).map((department) => (
                            <option key={department} value={department}>
                              {getDepartmentLabel(department)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Assignee</label>
                        <select
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={selectedTask.assignedToId || ""}
                          onChange={(event) => {
                            const found = assignees.find((item) => item.id === event.target.value);
                            setTempChanges((prev) => ({
                              ...prev,
                              assignedToId: event.target.value || undefined,
                              assignedToName: found?.name,
                            }));
                          }}
                        >
                          <option value="">Unassigned</option>
                          {assignees
                            .filter((item) => item.department === selectedTask.department)
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Due Date</label>
                        <input
                          type="date"
                          value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0, 10) : ""}
                          onChange={(event) =>
                            setTempChanges((prev) => ({
                              ...prev,
                              dueDate: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                            }))
                          }
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {createOpen && (
        <CreateTaskModal
          userId={userId}
          userName={userName}
          assignees={assignees}
          onClose={() => setCreateOpen(false)}
          onToast={showToast}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}
