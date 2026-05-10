import Link from "next/link";

export default function Home() {
return (
<main className="min-h-screen bg-blue-600 text-white flex items-center justify-center">
<div className="text-center">
<h1 className="text-7xl font-bold mb-6">BillSwift</h1>
<p className="text-2xl mb-8">Create beautiful invoices in 30 seconds.</p>

    <Link
      href="/dashboard"
      className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold inline-block"
    >
      Get Started
    </Link>
  </div>
</main>

);
}