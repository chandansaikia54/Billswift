"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HistoryPage() {

  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);

  // FETCH INVOICES

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setInvoices(data);
    } else {
      console.log(error);
    }
  }

  // DELETE

  const deleteInvoice = async (id: any) => {

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Error deleting invoice");
    } else {
      fetchInvoices();
    }
  };

  // EDIT

  const editInvoice = (inv: any) => {

    localStorage.setItem(
      "editInvoice",
      JSON.stringify(inv)
    );

    window.location.href = "/invoices";
  };

  // CURRENCY SYMBOLS

  const currencyMap: any = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  // PDF DOWNLOAD

  const downloadFromHistory = (inv: any) => {

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // PARSE ITEMS

    let parsedItems = [];

    try {
      parsedItems = JSON.parse(
        inv.description || "[]"
      );
    } catch {
      parsedItems = [];
    }

    // HEADER

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.text(
      "BillSwift Invoice",
      14,
      20
    );

    // SHOP DETAILS

    doc.setFontSize(18);

    doc.text(
      inv.shop_name || "Shop Name",
      105,
      30,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(12);

    doc.text(
      inv.address || "Address",
      105,
      40,
      {
        align: "center",
      }
    );

    doc.text(
      inv.contact || "Phone No.",
      105,
      48,
      {
        align: "center",
      }
    );

    // DATE + INVOICE

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      `Date: ${new Date(
        inv.created_at
      ).toLocaleDateString()}`,
      195,
      40,
      {
        align: "right",
      }
    );

    doc.text(
      "Invoice No:",
      195,
      52,
      {
        align: "right",
      }
    );

    doc.text(
      inv.invoice_no || "",
      195,
      62,
      {
        align: "right",
      }
    );

    // CUSTOMER

    doc.setFontSize(15);

    doc.text(
      "Customer Details:",
      14,
      82
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(12);

    doc.text(
      `Customer Name: ${inv.customer || ""}`,
      14,
      95
    );

    // TABLE

    autoTable(doc, {

      startY: 110,

      head: [[
        "Sl No",
        "Item Description",
        "Qty",
        `Price (${inv.currency})`,
        "Discount",
        `Total (${inv.currency})`,
      ]],

      body: parsedItems.map(
        (
          item: any,
          index: number
        ) => [
          index + 1,
          item.description,
          item.quantity,
          item.price,
          index === 0
            ? inv.discount || 0
            : "",
          item.quantity *
            item.price,
        ]
      ),

      styles: {
        fontSize: 11,
        cellPadding: 4,
        halign: "center",
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },

      columnStyles: {

        0: {
          cellWidth: 22,
        },

        1: {
          cellWidth: 65,
        },

        2: {
          cellWidth: 18,
        },

        3: {
          cellWidth: 28,
        },

        4: {
          cellWidth: 28,
        },

        5: {
          cellWidth: 32,
        },
      },

      margin: {
        left: 14,
        right: 14,
      },

      tableWidth: "auto",
    });

    // TOTALS

    const finalY =
      (doc as any)
        .lastAutoTable.finalY;

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Tax / GST :",
      140,
      finalY + 20
    );

    doc.text(
      "0",
      190,
      finalY + 20,
      {
        align: "right",
      }
    );

    doc.line(
      140,
      finalY + 24,
      190,
      finalY + 24
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Grand Total :",
      140,
      finalY + 36
    );

    doc.text(
      `${inv.currency} ${inv.total}`,
      190,
      finalY + 36,
      {
        align: "right",
      }
    );

    doc.line(
      140,
      finalY + 40,
      190,
      finalY + 40
    );

    // SIGNATURE

    doc.setFontSize(12);

    doc.text(
      "Authorized Signature",
      140,
      finalY + 65
    );

    // FOOTER

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "NB: Any customizable text.",
      14,
      280
    );

    // SAVE PDF

    doc.save(
      `invoice_${inv.invoice_no}.pdf`
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold text-blue-600 mb-8">
        Invoice History
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search customer or invoice no..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="mb-6 w-full border border-gray-400 p-3 rounded-xl text-black bg-white"
        />

        {/* TABLE */}

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-gray-200 border-b text-black">

              <th className="p-4 text-left font-bold">
                Invoice No
              </th>

              <th className="p-4 text-center font-bold">
                Customer
              </th>

              <th className="p-4 text-center font-bold">
                Total
              </th>

              <th className="p-4 text-center font-bold">
                Date
              </th>

              <th className="p-4 text-center font-bold">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {invoices
              .filter(
                (inv) =>
                  inv.customer
                    ?.toLowerCase()
                    .includes(
                      search.toLowerCase()
                    ) ||
                  inv.invoice_no
                    ?.toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
              )
              .map((inv) => (

                <tr
                  key={inv.id}
                  className="border-b hover:bg-gray-100 text-black"
                >

                  <td className="p-4 font-medium">
                    {inv.invoice_no}
                  </td>

                  <td className="p-4 text-center">
                    {inv.customer}
                  </td>

                  <td className="p-4 text-center font-bold text-green-700">
                    {currencyMap[
                      inv.currency
                    ]}{" "}
                    {inv.total}
                  </td>

                  <td className="p-4 text-center">
                    {new Date(
                      inv.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          editInvoice(inv)
                        }
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          downloadFromHistory(
                            inv
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() =>
                          deleteInvoice(
                            inv.id
                          )
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>
              ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}