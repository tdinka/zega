import { notFound } from "next/navigation";
export const metadata = { title: "Review Amharic | Zega", robots: { index: false } };
// The review screen exists only on Tsega's own computer.
export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();
  return children;
}
