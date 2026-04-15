"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const handleSignOut = async () => {
    closeSidebar();
    await signOut(auth);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand" onClick={closeSidebar}>
        Keep<span>er</span>
      </Link>

      <button
        className="hamburger-btn"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isSidebarOpen ? (
            <path d="M18 6L6 18M6 6l12 12"></path>
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18"></path>
          )}
        </svg>
      </button>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className={`navbar-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="navbar-brand" onClick={closeSidebar}>
            Keep<span>er</span>
          </Link>
          <button
            className="close-sidebar-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {!loading && user && (
          <ul className="navbar-links">
            <li>
              <Link href="/" onClick={closeSidebar}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard" onClick={closeSidebar}>
                Notes
              </Link>
            </li>
          </ul>
        )}

        <div className="navbar-right">
          {!loading ? (
            user ? (
              <>
                <span className="navbar-user-email">{user.email}</span>
                <button className="btn btn-sign-out" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            ) : null
          ) : null}
        </div>
      </div>
    </nav>
  );
}
