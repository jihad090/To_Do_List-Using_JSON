import { NextResponse } from "next/server";
import { createTodo, getAllTodos } from "../../../../lib/todoStore";
// import { getAllTodos, createTodo } from "@/lib/todoStore";

export async function GET() {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body as { title?: string };

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    const newTodo = await createTodo(title.trim());
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create todo" },
      { status: 500 }
    );
  }
}
