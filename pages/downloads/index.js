import Link from "next/link";
import { useAuth } from "../../context/authContext";

export default function DownloadsPage() {
  const { user, authReady } = useAuth();

  if (!authReady) return <p className="p-6">Loading your library…</p>;

  if (!user) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Your Downloads</h1>
        <p>
          Please{" "}
          <Link className="text-accent underline" href="/account?returnTo=/downloads">
            log in
          </Link>{" "}
          to view your downloads.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Downloads</h1>
      <p>Your purchased collections will appear here.</p>
    </main>
  );
}
