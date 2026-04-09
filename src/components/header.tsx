import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold">
          <Link href="/" className="hover:underline">
            github-ai-repo
          </Link>
        </h1>
      </div>
    </header>
  );
}
