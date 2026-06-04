"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*");

    if (error || !data) return;
    const latestInvoices = [...data]
  .sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )
  .slice(0, 5);

setRecentInvoices(latestInvoices);

    setTotalInvoices(data.length);

    const today = new Date();

const todayStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

const todayEnd = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todayTotal = 0;
    let monthTotal = 0;
    let revenueTotal = 0;

    data.forEach((inv: any) => {
      const amount = Number(inv.total || 0);

      revenueTotal += amount;

      const invoiceDate = new Date(
        inv.created_at || inv.date
      );

      if (
  invoiceDate >= todayStart &&
  invoiceDate < todayEnd
) {
  todayTotal += amount;
}

      if (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      ) {
        monthTotal += amount;
      }
    });

    setTodaySales(todayTotal);
    setMonthSales(monthTotal);
    setTotalRevenue(revenueTotal);
  }

  return (
    <main className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-600 text-white p-6">
        <h2 className="text-3xl font-bold mb-8">
          BillSwift
        </h2>

        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="block hover:text-gray-200"
          >
            Dashboard
          </Link>

          <Link
            href="/invoices"
            className="block hover:text-gray-200"
          >
            Invoices
          </Link>

          <Link
            href="/history"
            className="block hover:text-gray-200"
          >
            History
          </Link>

          <Link
            href="/"
            className="block hover:text-gray-200"
          >
            Home
          </Link>
          <Link
  href="/customers"
  className="block hover:text-gray-200"
>
  Customers
</Link>

  <Link
  href="/products"
  className="block hover:text-gray-200"
>
  Products
</Link>
        </nav>
      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-8">
  <h1 className="text-4xl font-bold text-blue-600 mb-6">
    Dashboard
  </h1>

  {/* DASHBOARD CARDS */}
  <div className="grid gap-6 md:grid-cols-4">

    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold text-gray-600">
        Total Invoices
      </h2>
      <p className="text-3xl mt-3 font-bold">
        {totalInvoices}
      </p>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold text-gray-600">
        Today's Sales
      </h2>
      <p className="text-3xl mt-3 font-bold text-green-600">
        ₹ {todaySales.toFixed(2)}
      </p>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold text-gray-600">
        This Month
      </h2>
      <p className="text-3xl mt-3 font-bold text-blue-600">
        ₹ {monthSales.toFixed(2)}
      </p>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold text-gray-600">
        Total Revenue
      </h2>
      <p className="text-3xl mt-3 font-bold text-purple-600">
        ₹ {totalRevenue.toFixed(2)}
      </p>
    </div>

  </div>
<div className="md:col-span-4 bg-white rounded-2xl shadow p-6">
  <h2 className="text-xl font-bold mb-4">
    Quick Actions
  </h2>

  <div className="flex gap-4 flex-wrap">
    <Link
      href="/invoices"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      ➕ Create Invoice
    </Link>

    <Link
      href="/history"
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
    >
      📜 Invoice History
    </Link>

    <Link
      href="/"
      className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
    >
      🏠 Home
    </Link>
  </div>
</div>
  {/* RECENT INVOICES */}
  <div className="mt-10 bg-white rounded-2xl shadow p-6 overflow-x-auto">

    <h2 className="text-2xl font-bold mb-6">
      Recent Invoices
    </h2>

    <table className="w-full">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left py-3 px-3">Invoice No</th>
          <th className="text-left py-3 px-3">Customer</th>
          <th className="text-left py-3 px-3">Amount</th>
          <th className="text-left py-3 px-3">Date</th>
        </tr>
      </thead>

      <tbody>
        {recentInvoices.map((inv) => (
          <tr
            key={inv.id}
            className="border-b hover:bg-gray-50"
          >
            <td className="py-3 px-3">
              {inv.invoice_no || "-"}
            </td>

            <td className="px-3">
              {inv.customer}
            </td>

            <td className="px-3 font-semibold text-green-600">
              ₹ {Number(inv.total || 0).toFixed(2)}
            </td>

            <td className="px-3">
              {new Date(
                inv.created_at
              ).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
  <div className="bg-white rounded-2xl shadow p-6 md:col-span-4">
  <h2 className="text-2xl font-bold mb-4">
    Sales Overview
  </h2>

  <div className="h-64 flex items-center justify-center text-gray-400">
    Sales Chart Coming Soon
  </div>
</div>
</section>
    </main>
  );
}