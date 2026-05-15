"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InvoicesPage() {

  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);

  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(18);
  const [currency, setCurrency] = useState("INR");

  const [shopName, setShopName] = useState("Shop Name");
  const [shopAddress, setShopAddress] = useState("Address");
  const [contactDetails, setContactDetails] = useState("Phone No.");

  const currencyMap: any = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  useEffect(() => {
    const savedShop = localStorage.getItem("shopName");
    const savedAddress = localStorage.getItem("shopAddress");
    const savedContact = localStorage.getItem("contactDetails");

    if (savedShop) setShopName(savedShop);
    if (savedAddress) setShopAddress(savedAddress);
    if (savedContact) setContactDetails(savedContact);
  }, []);

  useEffect(() => {
    localStorage.setItem("shopName", shopName);
    localStorage.setItem("shopAddress", shopAddress);
    localStorage.setItem("contactDetails", contactDetails);
  }, [shopName, shopAddress, contactDetails]);

  // CALCULATIONS

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const gstAmount = (subtotal * gst) / 100;

  const total = subtotal + gstAmount - discount;

  // ITEM HANDLING

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // SAVE INVOICE

  const saveInvoice = async () => {
    const invoiceNo = "INV-" + Date.now();
    const firstItem = items[0];

    const { error } = await supabase
      .from("invoices")
      .insert([
        {
          customer,
          description: JSON.stringify(items),
          subtotal,
          gst,
          quantity: firstItem.quantity,
          price: firstItem.price,
          discount,
          total,
          invoice_no: invoiceNo,
          currency,
          shop_name: shopName,
          address: shopAddress,
          contact: contactDetails,
        },
      ]);

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
    } else {
      alert("Invoice saved successfully!");

      setCustomer("");
      setItems([{ description: "", quantity: 1, price: 0 }]);
      setDiscount(0);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
        BillSwift Invoice
      </h1>

      <div className="bg-white max-w-4xl mx-auto p-8 rounded-2xl shadow-lg">

        {/* BUSINESS DETAILS */}

        <div className="border rounded-2xl p-6 bg-gray-50 mb-8">

          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Business Details
          </h2>

          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full p-3 border rounded mb-3"
            placeholder="Shop Name"
          />

          <input
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            className="w-full p-3 border rounded mb-3"
            placeholder="Address"
          />

          <input
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Contact"
          />
        </div>

        {/* CUSTOMER */}

        <input
          type="text"
          placeholder="Customer Name"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="w-full p-3 border rounded mb-6"
        />

        {/* ITEMS */}

        {items.map((item, index) => (
          <div key={index} className="border p-4 mb-4 rounded">

            <input
              value={item.description}
              onChange={(e) =>
                updateItem(index, "description", e.target.value)
              }
              className="w-full p-3 border rounded mb-3"
              placeholder="Item Description"
            />

            <div className="flex gap-4">

              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
                className="w-full p-3 border rounded"
              />

              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", Number(e.target.value))
                }
                className="w-full p-3 border rounded"
              />

            </div>

            <p className="mt-2 font-bold">
              Item Total: {currencyMap[currency]}{" "}
              {(item.quantity * item.price).toFixed(2)}
            </p>

          </div>
        ))}

        <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded mb-6">
          + Add Item
        </button>

        {/* GST */}

        <input
          type="number"
          value={gst}
          onChange={(e) => setGst(Number(e.target.value))}
          className="w-full p-3 border rounded mb-4"
          placeholder="GST %"
        />

        {/* DISCOUNT */}

        <input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="w-full p-3 border rounded mb-4"
          placeholder="Discount"
        />

        {/* TOTALS */}

        <div className="bg-gray-100 p-6 rounded mb-6">

          <p>Subtotal: {currencyMap[currency]} {subtotal.toFixed(2)}</p>
          <p>GST ({gst}%): {currencyMap[currency]} {gstAmount.toFixed(2)}</p>
          <p>Discount: {currencyMap[currency]} {discount.toFixed(2)}</p>

          <hr className="my-3" />

          <p className="text-2xl font-bold text-blue-700">
            Total: {currencyMap[currency]} {total.toFixed(2)}
          </p>

        </div>

        <button
          onClick={saveInvoice}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Save Invoice
        </button>

      </div>
    </main>
  );
}