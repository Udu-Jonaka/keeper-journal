import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(request) {
  const cookieStore = cookies();
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

  const { postId, text } = body;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return NextResponse.json({ message: "Invalid post ID." }, { status: 400 });
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { message: "Comment text is required." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    post.comments.push({
      authorEmail: sessionEmail,
      text: text.trim(),
    });

    await post.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { message: "Failed to save comment." },
      { status: 500 },
    );
  }
}
