import { NextResponse } from "next/server";
import { getTodoById, updateTodo, deleteTodo } from "../../../../../lib/todoStore";

// GET
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const todo = await getTodoById(id);

    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch todo" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, completed } = body;

    const updated = await updateTodo(id, { title, completed });

    if (!updated) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update todo" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const ok = await deleteTodo(id);

    if (!ok) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete todo" }, { status: 500 });
  }
}
