"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const router = useRouter();

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
doc.rect(5, 5, 200, 287);
    // Parse items safely
    let items: any[] = [];
    try {
      items = JSON.parse(inv.description || "[]");
    } catch {
      items = [];
    }

    // HEADER
doc.setFontSize(16);
doc.text("BillSwift", 14, 15);

doc.setFontSize(10);
doc.text("Smart Billing Solution", 14, 21);

doc.setFontSize(14);
doc.text(inv.shop_name || "Your Store", 105, 20, { align: "center" });

doc.setFontSize(10);
doc.text(inv.address || "", 105, 26, { align: "center" });
doc.text(inv.contact || "", 105, 31, { align: "center" });

// RIGHT SIDE INFO
doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 150, 20);
doc.text(`Invoice No: ${inv.invoice_no}`, 150, 26);


    // Customer
    doc.text("Customer Details:", 14, 55);
    doc.text(`Customer Name: ${inv.customer}`, 14, 61);

    // TABLE
    autoTable(doc, {
  startY: 70,

  head: [["Sl No", "Item", "Qty", "Price", "Disc", "Total"]],

  body: items.map((item: any, index: number) => [
  index + 1,
  item.description || "",   // ✅ FIXED
  item.quantity || 0,       // ✅ FIXED
  item.price || 0,
  item.discount || 0,
  item.total || 0,
]),

  styles: {
    halign: "center",   // ✅ horizontal center
    valign: "middle",   // ✅ vertical center
    fontSize: 10,
  },

  headStyles: {
    fillColor: [52, 122, 183],
    textColor: 255,
    halign: "center",
    valign: "middle",
  },

  columnStyles: {
    1: { halign: "left" }, // 👈 ONLY Item column left-aligned (better readability)
  },
});

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    const subtotal = inv.subtotal || 0;
    const gst = inv.gst || 0;
    const gstAmount = (subtotal * gst) / 100;

    // TOTALS
    const totalX = 190;

doc.setFontSize(10);

// SAME Y for label + value
doc.text("Subtotal:", 140, finalY);
doc.text(`Rs. ${subtotal.toFixed(2)}`, 200, finalY, { align: "right" });

doc.text(`GST (${gst}%):`, 140, finalY + 6);
doc.text(`Rs. ${gstAmount.toFixed(2)}`, 200, finalY + 6, { align: "right" });

doc.text("Discount:", 140, finalY + 12);
doc.text(`Rs. ${inv.discount || 0}`, 200, finalY + 12, { align: "right" });

doc.text("----------------------", 140, finalY + 16);

doc.setFontSize(12);
doc.text("Grand Total:", 140, finalY + 22);
doc.text(`Rs. ${inv.total}`, 200, finalY + 22, { align: "right" });

    // SIGNATURE (aligned with totals column)
const signatureX = 200; // SAME as totals values column

doc.setFontSize(10);

// Increase gap from Grand Total
const signatureY = finalY + 45;

doc.text("Authorized Signature", signatureX, signatureY, { align: "right" });
doc.text("(Stamp & Signature)", signatureX, signatureY + 6, { align: "right" });

    // FOOTER
    doc.text("Thank you for your business!", 14, 280);
    doc.save(`${inv.invoice_no}.pdf`);
  }
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
        {invoices.map((inv) => (
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