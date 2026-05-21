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
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setInvoices(data || []);
  }

  // ✅ DELETE
  async function handleDelete(id: number) {
    if (!confirm("Delete this invoice?")) return;

    await supabase.from("invoices").delete().eq("id", id);
    fetchInvoices();
  }

  // ✅ PDF GENERATION (FULLY FIXED)
  function generatePDF(inv: any) {
  const doc = new jsPDF();

  // =========================
  // OUTER BORDER
  // =========================
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // =========================
  // HEADER (LEFT)
  // =========================
  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.text("BillSwift", 14, 15);

  doc.setFontSize(10);
  doc.text("Smart Billing Solution", 14, 21);

  doc.setFont("helvetica", "normal");

  // =========================
  // SHOP DETAILS (CENTER)
  // =========================
  doc.setFontSize(14);
  doc.text(inv.shop_name || "Your Store", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(inv.address || "", 105, 26, { align: "center" });
  doc.text(inv.contact || "", 105, 31, { align: "center" });
  doc.text(`GSTIN: ${inv.gstin || ""}`, 105, 36, { align: "center" });

  // =========================
  // INVOICE INFO (RIGHT)
  // =========================
  doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 140, 40);
  doc.text(`Invoice No: ${inv.invoice_no}`, 140, 45);

  // =========================
  // CUSTOMER DETAILS
  // =========================
  doc.text(`Customer Details: ${inv.customer}`, 14, 55);

  <input
  type="text"
  placeholder="Search by customer or invoice no..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    padding: "8px",
    width: "300px",
    marginBottom: "15px",
    border: "1px solid #ccc",
  }}
/>
>
<div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />
</div>

  // =========================
  // ITEMS TABLE
  // =========================
  let items = [];
  try {
    items = JSON.parse(inv.description || "[]");
  } catch {
    items = [];
  }

  autoTable(doc, {
    startY: 65,
    head: [["Sl No", "Item", "Qty", "Price", "Disc", "Total"]],
    body: items.map((item: any, index: number) => {
      const qty = item.quantity || 0;
      const price = item.price || 0;
      const discount = item.discount || 0;
      const total = qty * price - discount;

      return [
        index + 1,
        item.description || "",
        qty,
        `Rs. ${price.toFixed(2)}`,
        discount,
        `Rs. ${total.toFixed(2)}`,
      ];
    }),

    styles: {
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const subtotal = inv.subtotal || 0;
  const gst = inv.gst || 0;
  const gstAmount = (subtotal * gst) / 100;

  // =========================
  // TOTALS (ALIGNED)
  // =========================
  doc.text("Subtotal:", 125, finalY);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, 185, finalY, { align: "right" });

  doc.text(`GST (${gst}%):`, 125, finalY + 6);
  doc.text(`Rs. ${gstAmount.toFixed(2)}`, 185, finalY + 6, { align: "right" });

  doc.text("Discount:", 125, finalY + 12);
  doc.text(`Rs. ${(inv.discount || 0).toFixed(2)}`, 185, finalY + 12, { align: "right" });

  // LINE
  doc.line(120, finalY + 16, 185, finalY + 16);

  // GRAND TOTAL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", 120, finalY + 22);
  doc.text(`Rs. ${Number(inv.total).toFixed(2)}`, 185, finalY + 22, { align: "right" });
  doc.setFont("helvetica", "normal");

  // =========================
  // SIGNATURE
  // =========================
  const signatureY = finalY + 65;

  doc.text("Authorized Signature", 185, signatureY, { align: "right" });
  doc.text("(Stamp & Signature)", 185, signatureY + 6, { align: "right" });

  // =========================
  // FOOTER
  // =========================
  const pageHeight = doc.internal.pageSize.height;

doc.text("NB: Thank you for doing business with us!", 12, pageHeight - 10);

  doc.save(`${inv.invoice_no}.pdf`);
}
{invoices.filter((inv) => {
  const matchesSearch =
    (inv.customer || "").toLowerCase().includes(search.toLowerCase()) ||
    (inv.invoice_no || "").toLowerCase().includes(search.toLowerCase());

  const invoiceDate = new Date(inv.date);

  const matchesFromDate = fromDate
    ? invoiceDate >= new Date(fromDate)
    : true;

  const matchesToDate = toDate
    ? invoiceDate <= new Date(toDate)
    : true;

  return matchesSearch && matchesFromDate && matchesToDate;
}).length === 0 && (
  <p>No invoices found</p>
)}
    
{invoices
  .filter((inv) => {
    const matchesSearch =
      (inv.customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.invoice_no || "").toLowerCase().includes(search.toLowerCase());

    const invoiceDate = new Date(inv.date);

    const matchesFromDate = fromDate
      ? invoiceDate >= new Date(fromDate)
      : true;

    const matchesToDate = toDate
      ? invoiceDate <= new Date(toDate)
      : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  })
  .sort((a, b) => {
  const dateA = new Date(a.date || a.created_at).getTime();
  const dateB = new Date(b.date || b.created_at).getTime();
console.log("Sort Order:", sortOrder);
  return sortOrder === "latest"
    ? dateB - dateA
    : dateA - dateB;
})
  .map((inv) => (
    <tr key={inv.id}>
      {/* your row content */}
    </tr>
  ))}
const th = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "left" as const,
};

const td = {
  padding: "10px",
  border: "1px solid #ddd",
};

const editBtn = {
  marginRight: "6px",
  padding: "5px 10px",
  background: "#f0ad4e",
  border: "none",
  cursor: "pointer",
};

const pdfBtn = {
  marginRight: "6px",
  padding: "5px 10px",
  background: "#0275d8",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "5px 10px",
  background: "#d9534f",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
  // ✅ UI (clean white — no dark bug)
 return (
  <div style={{ padding: 20, background: "#fff", minHeight: "100vh" }}>
    <h1 style={{ fontSize: 28, marginBottom: 20 }}>Invoice History</h1>

<select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
  style={{ padding: "8px", marginBottom: "15px" }}
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
    margin: "15px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  }}
/>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <th style={th}>Invoice No</th>
          <th style={th}>Customer</th>
          <th style={th}>Total</th>
          <th style={th}>Date</th>
          <th style={th}>Action</th>
        </tr>
      </thead>

      <tbody>
        {invoices
  .filter((inv) =>
    inv.customer?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_no?.toLowerCase().includes(search.toLowerCase())
  )
  .map((inv) => (
          <tr key={inv.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={td}>{inv.invoice_no}</td>
            <td style={td}>{inv.customer}</td>
            <td style={{ ...td, color: "green", fontWeight: "bold" }}>
              Rs. {Number(inv.total).toFixed(2)}
            </td>
            <td style={td}>
              {new Date(inv.created_at).toLocaleDateString()}
            </td>

            {/* ✅ FIXED ACTION BUTTONS */}
            <td style={td}>
              <button style={editBtn}
               onClick={() => router.push(`/invoices?id=${inv.id}`)}
              >
                Edit
              </button>

              <button style={pdfBtn}
                onClick={() => generatePDF(inv)}
              >
                PDF
              </button>

              <button style={deleteBtn}
                onClick={() => handleDelete(inv.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}