import fs from "fs";
import path from "path";
import { Todo } from "./types";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "todos.json");
    // process.cwd() returns path of our root folder. Joining data, todos.json with root file path will result in absolute path for out json (works as DB in this project)

async function readTodos(): Promise<Todo[]> {
  const fileData = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
  return JSON.parse(fileData) as Todo[];
}

async function writeTodos(todos: Todo[]): Promise<void> {
  await fs.promises.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(todos, null, 2),
    "utf-8"
  );
}

export async function getAllTodos(): Promise<Todo[]> {
  const todos = await readTodos();
  // Sort by createdAt (latest first)
  return todos.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    // If the function returns a negative number, then a should come before b.
  );
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  const todos = await readTodos();
  return todos.find((t) => t.id === id);
}

export async function createTodo(title: string): Promise<Todo> {
  const todos = await readTodos();

  const newTodo: Todo = {
    id: Date.now().toString(), // simple ID
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, "id" | "createdAt">>
): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) return null;

  todos[index] = {
    ...todos[index],
    ...updates,
  };

  await writeTodos(todos);
  return todos[index];
}

export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await readTodos();
  const newTodos = todos.filter((t) => t.id !== id);

  if (newTodos.length === todos.length) return false;

  await writeTodos(newTodos);
  return true;
}
