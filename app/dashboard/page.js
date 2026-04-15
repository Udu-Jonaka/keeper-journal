"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading…</p>
      </div>
    );
  }

  if (!user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Both a title and some content are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong.");
      }

      setTitle("");
      setContent("");
      setSuccess("Your Note has been saved to the journal.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">New Note</h1>
        <p className="page-subtitle">
          Writing as <strong>{user.email}</strong>
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="status-error">{error}</div>}
          {success && <div className="status-success">{success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Give this note a name…"
              value={title}
              onChange={function (e) {
                setTitle(e.target.value);
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              className="form-textarea"
              placeholder="What's on your mind today?"
              value={content}
              onChange={function (e) {
                setContent(e.target.value);
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Publish Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
