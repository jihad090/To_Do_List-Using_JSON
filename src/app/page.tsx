"use client";

import { useEffect, useState } from "react";
import { Todo } from "../../lib/types";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Fetch all todos
  async function fetchTodos() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/todos");
      if (!res.ok) {
        throw new Error("Failed to load todos");
      }
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  // Create
  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      setError(null);

      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to create todo");
      }

      const created: Todo = await res.json();
      setTodos((prev) => [created, ...prev]);
      setNewTitle("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  // Toggle completed
  async function toggleCompleted(todo: Todo) {
    try {
      setError(null);
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: !todo.completed,
          title: todo.title
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to update todo");
      }

      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  // Start editing
  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  // Save edit
  async function saveEdit(todoId: string) {
    if (!editingTitle.trim()) return;

    try {
      setError(null);
      const res = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to update todo");
      }

      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null);
      setEditingTitle("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  // Delete
  async function handleDelete(id: string) {
    const confirmDelete = window.confirm("Delete this todo?");
    if (!confirmDelete) return;

    try {
      setError(null);
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to delete todo");
      }

      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-2 text-center">
          To Do list with Json file
        </h1>
        <p className="text-slate-400 mb-6 text-center text-sm">
          JSON file as database • Full CRUD with API routes
        </p>

        {/* Add form */}
        <form
          onSubmit={handleAddTodo}
          className="flex gap-2 mb-6 bg-slate-900 p-3 rounded-xl border border-slate-800"
        >
          <input
            type="text"
            className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-sm font-medium disabled:opacity-50 hover:bg-indigo-600 transition"
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-700/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center text-slate-400 text-sm mb-4">
            Loading todos...
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {todos.length === 0 && !loading && (
            <p className="text-center text-slate-500 text-sm">
              No tasks yet. Add your first todo!
            </p>
          )}

          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.completed ?? false}
                onChange={() => toggleCompleted(todo)}
                className="h-4 w-4"
              />

              <div className="flex-1">
                {editingId === todo.id ? (
                  <input
                    className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-sm ${
                      todo.completed ? "line-through text-slate-500" : ""
                    }`}
                  >
                    {todo.title}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(todo.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Edit / Save / Cancel buttons */}
              {editingId === todo.id ? (
                <>
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="text-xs px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingTitle("");
                    }}
                    className="text-xs px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing(todo)}
                  className="text-xs px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600"
                >
                  Edit
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => handleDelete(todo.id)}
                className="text-xs px-2 py-1 rounded-md bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
