import Link from "next/link";

export function MigrationNotice({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-semibold text-2xl text-white">{title}</h1>
      <p className="text-sm text-zinc-400">
        This area is temporarily disabled while the platform migrates fully to
        Supabase.
      </p>
      <Link className="text-sm text-zinc-200 underline" href="/">
        Go back home
      </Link>
    </main>
  );
}
