import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "Keeper",
  description: "A safe space for just the two of us.",
  manifest: "/manifest.json",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keeper",
  },
};

export const viewport = {
  themeColor: "#C8A2C8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta
        name="google-site-verification"
        content="QynKCI1qkUU-_GvhYD1Ry6uABbbXQwGqJvK9qcQ2VYg"
      />
      <body suppressHydrationWarning>
        {/* AuthProvider wraps the app so the session is available everywhere */}
        <AuthProvider>
          <Navbar />
          {/* A main container to keep the content centered and padded */}
          <main className="main-container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
