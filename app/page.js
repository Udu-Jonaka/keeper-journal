import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import CommentForm from "@/components/CommentForm";
import SignInPage from "@/components/SignInPage";

function formatDate(dateString) {
  if (!dateString) return "Just now"; // Safety fallback
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayName(email) {
  if (!email) return "Anonymous"; // Safety fallback
  return email.split("@")[0];
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    return <SignInPage />;
  }

  await connectToDatabase();

  // 1. Fetch the raw leaned posts
  const rawPosts = await Post.find({}).sort({ createdAt: -1 }).lean();

  // 2. The Silver Bullet Serialization
  // This safely forces all Mongoose data into pure JSON, preventing Turbopack crashes.
  const posts = JSON.parse(JSON.stringify(rawPosts));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Our Journal</h1>
        <p className="page-subtitle">A space to share our thoughts.</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">✦</span>
          <h2 className="empty-state-title">Nothing here yet</h2>
          <p className="empty-state-body">
            Be the first to write an entry in the journal.
          </p>
        </div>
      ) : (
        <div>
          {posts.map(function (post) {
            return (
              <article key={post._id} className="post-card">
                <div className="post-card-header">
                  <h2 className="post-card-title">{post.title}</h2>
                  <div className="post-card-meta">
                    <span className="post-card-author">
                      {getDisplayName(post.authorEmail)}
                    </span>
                    <span className="post-card-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="post-card-content">{post.content}</p>

                <hr className="post-card-divider" />

                <div className="comments-section">
                  <p className="comments-title">
                    {post.comments?.length === 0 || !post.comments
                      ? "Comments"
                      : `${post.comments.length} Comment${
                          post.comments.length === 1 ? "" : "s"
                        }`}
                  </p>

                  {post.comments?.length === 0 || !post.comments ? (
                    <p className="no-comments">
                      No comments yet. Be the first to respond.
                    </p>
                  ) : (
                    <div className="comments-list">
                      {post.comments.map(function (comment, index) {
                        return (
                          <div
                            key={comment._id || index}
                            className="comment-item"
                          >
                            <div className="comment-header">
                              <span className="comment-author">
                                {getDisplayName(comment.authorEmail)}
                              </span>
                              <span className="comment-date">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Safely pass the serialized ID */}
                  <CommentForm postId={post._id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
