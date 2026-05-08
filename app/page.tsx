import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f5] p-8">
      <Link
        href="/auto-ppt"
        className="bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115e59]"
      >
        Open Auto PPT
      </Link>
    </main>
  );
}
