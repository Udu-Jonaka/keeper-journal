import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get("keeper_session")?.value;

  const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS
    ? process.env.NEXT_PUBLIC_ALLOWED_EMAILS.split(",").map((e) => e.trim())
    : [];

  if (!sessionEmail || !allowedEmails.includes(sessionEmail)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { title, content } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { message: "Title is required." },
      { status: 400 },
    );
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { message: "Content is required." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      authorEmail: sessionEmail,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json(
      { message: "Failed to create post." },
      { status: 500 },
    );
  }
}
