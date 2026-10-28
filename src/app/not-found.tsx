import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <Link href="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
