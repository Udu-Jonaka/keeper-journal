"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ postId }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Could not post comment.");
      }

      setText("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {error && <p className="status-error">{error}</p>}
      <div className="comment-form-row">
        <textarea
          className="form-textarea form-textarea-comment"
          placeholder="Leave a response…"
          value={text}
          onChange={function (e) {
            setText(e.target.value);
          }}
          rows={2}
        />
        <button
          type="submit"
          className="btn btn-primary comment-submit-btn"
          disabled={isSubmitting || !text.trim()}
        >
          {isSubmitting ? "…" : "Reply"}
        </button>
      </div>
    </form>
  );
}
