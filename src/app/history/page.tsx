"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    fetchInvoices();
  }, []);

 async function fetchInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("Invoices Data:", data);
  console.log("Invoices Error:", error);

  if (error) {
    console.error(error);
    return;
  }

  setInvoices(data ?? []);
}

  async function handleDelete(id: number) {
    if (!confirm("Delete this invoice?")) return;
    await supabase.from("invoices").delete().eq("id", id);
    fetchInvoices();
  }

  function generatePDF(inv: any) {
    const doc = new jsPDF();
    doc.text("Invoice", 20, 20);
    doc.save(`${inv.invoice_no}.pdf`);
  }
console.log("Invoices State:", invoices);
  const filteredInvoices = invoices
  .filter((inv) => {
    if (!search) return true;

    return (
      (inv.customer || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (inv.invoice_no || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div style={{ padding: "30px", background: "#f4f6f9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "20px" }}>
        Invoice History
      </h1>

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <input
          type="text"
          placeholder="Search by customer or invoice no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          
          {/* TABLE HEADER */}
          <thead style={{ background: "#1f2937", color: "#fff" }}>
            <tr>
              <th style={th}>Invoice No</th>
              <th style={th}>Customer</th>
<th style={th}>Products</th>
<th style={th}>Total</th>
<th style={th}>Status</th>
              <th style={th}>Date</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {filteredInvoices.map((inv, index) => (
              <tr
                key={inv.id}
                style={{
                  background: index % 2 === 0 ? "#f9fafb" : "#fff",
                }}
              >
                <td style={td}>{inv.invoice_no}</td>
                <td style={td}>
  {inv.customer || "-"}
</td>

<td style={td}>
  {(() => {
    try {
      const products = JSON.parse(
        inv.description || "[]"
      );

      return products
        .map((p: any) => p.description)
        .join(", ");
    } catch {
      return "-";
    }
  })()}
</td>

<td
  style={{
    ...td,
    color: "green",
    fontWeight: "600",
  }}
>
                  Rs. {Number(inv.total).toFixed(2)}
                </td>
                <td style={td}>
  {Number(inv.balance_due || 0) > 0 ? (
    <span
      style={{
        color: "#dc2626",
        fontWeight: "bold",
      }}
    >
      Pending
    </span>
  ) : (
    <span
      style={{
        color: "#16a34a",
        fontWeight: "bold",
      }}
    >
      Paid
    </span>
  )}
</td>
                <td style={td}>
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>

                {/* ACTION BUTTONS */}
                <td style={td}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    
                    <button
                      onClick={() => router.push(`/invoices?id=${inv.id}`)}
                      style={btnEdit}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => generatePDF(inv)}
                      style={btnPdf}
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => handleDelete(inv.id)}
                      style={btnDelete}
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No invoices found
          </p>
        )}
      </div>
    </div>
  );
}

/* STYLES */

const th = {
  padding: "14px",
  textAlign: "left" as const,
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

const btnEdit = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};

const btnPdf = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};

const btnDelete = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};