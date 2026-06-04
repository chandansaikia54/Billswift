"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("customer_name");

    setCustomers(data || []);
  }

  async function addCustomer() {
    if (!customerName.trim()) {
      alert("Enter customer name");
      return;
    }

    const { error } = await supabase
      .from("customers")
      .insert([
        {
          customer_name: customerName,
          phone,
          address,
          gstin,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCustomerName("");
    setPhone("");
    setAddress("");
    setGstin("");

    fetchCustomers();
  }

  async function deleteCustomer(id: number) {
    if (!confirm("Delete customer?")) return;

    await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    fetchCustomers();
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Customer Master
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <div className="grid md:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="GSTIN"
            value={gstin}
            onChange={(e) =>
              setGstin(e.target.value)
            }
            className="border p-2 rounded"
          />

        </div>

        <button
          onClick={addCustomer}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Customer
        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">
                Customer
              </th>
              <th className="text-left py-3">
                Phone
              </th>
              <th className="text-left py-3">
                Address
              </th>
              <th className="text-left py-3">
                GSTIN
              </th>
              <th className="text-left py-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3">
                  {c.customer_name}
                </td>

                <td>
                  {c.phone}
                </td>

                <td>
                  {c.address}
                </td>

                <td>
                  {c.gstin}
                </td>

                <td>
                  <button
                    onClick={() =>
                      deleteCustomer(c.id)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}