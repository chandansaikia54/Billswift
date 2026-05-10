import Link from "next/link";

export default function Dashboard() {
return (
<main className="min-h-screen flex bg-gray-100">
<aside className="w-64 bg-blue-600 text-white p-6">
<h2 className="text-3xl font-bold mb-8">BillSwift</h2>

    <nav className="space-y-4">
      <Link href="/dashboard" className="block hover:text-gray-200">
        Dashboard
      </Link>

      <Link href="/invoices" className="block hover:text-gray-200">
        Invoices
      </Link>

      <Link href="/" className="block hover:text-gray-200">
        Home
      </Link>
    </nav>
  </aside>

  <section className="flex-1 p-8">
    <h1 className="text-4xl font-bold text-blue-600 mb-6">
      Dashboard
    </h1>

    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Total Invoices</h2>
        <p className="text-3xl mt-2">12</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Paid</h2>
        <p className="text-3xl mt-2">$4,500</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Pending</h2>
        <p className="text-3xl mt-2">$1,200</p>
      </div>
    </div>
  </section>
</main>

);
}