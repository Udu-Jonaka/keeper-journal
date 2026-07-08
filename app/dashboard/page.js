"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading…</p>
      </div>
    );
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setImageFile(file);
    setError("");

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = function () {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadToCloudinary(file) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "keeper-journal");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      throw new Error("Image upload failed. Please try again.");
    }

    const data = await res.json();
    return data.secure_url;
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
    let imageUrl = "";

    try {
      // Upload image to Cloudinary if one is selected
      if (imageFile) {
        setUploadProgress("Uploading image…");
        imageUrl = await uploadToCloudinary(imageFile);
        setUploadProgress("Image uploaded ✓");
      }

      setUploadProgress(imageFile ? "Saving note…" : "");

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          ...(imageUrl && { imageUrl }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong.");
      }

      setTitle("");
      setContent("");
      setImageFile(null);
      setImagePreview("");
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("Your Note has been saved to the journal.");
    } catch (err) {
      setError(err.message);
      setUploadProgress("");
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

          <div className="form-group">
            <label className="form-label" htmlFor="image">
              Image <span className="form-label-optional">(optional)</span>
            </label>

            {!imagePreview ? (
              <label className="image-upload-zone" htmlFor="image">
                <span className="image-upload-icon">⬆</span>
                <span className="image-upload-text">
                  Click to attach an image
                </span>
                <span className="image-upload-hint">
                  PNG, JPG, GIF or WebP — max 5 MB
                </span>
                <input
                  id="image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="image-upload-input"
                  onChange={handleImageChange}
                />
              </label>
            ) : (
              <div className="image-preview-wrapper">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {uploadProgress && (
            <div className="upload-progress">{uploadProgress}</div>
          )}

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
