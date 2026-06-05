"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InvoicesPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
const id = searchParams.get("id");
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);
const [editingId, setEditingId] = useState<number | null>(null);
  const [customer, setCustomer] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(18);
  const [currency, setCurrency] = useState("INR");
  const [shopName, setShopName] = useState("Shop Name");
  const [shopAddress, setShopAddress] = useState("Address");
  const [contactDetails, setContactDetails] = useState("Phone No.");
  const [gstin, setGstin] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [amountReceived, setAmountReceived] = useState(0);
  
  

  const currencyMap: any = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  useEffect(() => {
  fetchProducts();
}, []);

async function fetchProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("product_name");

  setProducts(data || []);
}
  
  useEffect(() => {
  if (!id) return;

  const fetchInvoice = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setCustomer(data.customer || "");
      setGstin(data.gstin || "");
      setItems(JSON.parse(data.description || "[]"));
      setGst(data.gst || 0);
      setDiscount(data.discount || 0);
setAmountReceived(Number(data.amount_received || 0));
      setEditingId(data.id);
    }
  };

  fetchInvoice();
}, [id]);

  useEffect(() => {
    const savedShop = localStorage.getItem("shopName");
    const savedAddress = localStorage.getItem("shopAddress");
    const savedContact = localStorage.getItem("contactDetails");

    if (savedShop) setShopName(savedShop);
    if (savedAddress) setShopAddress(savedAddress);
    if (savedContact) setContactDetails(savedContact);
  }, []);

  useEffect(() => {
  const data = localStorage.getItem("editInvoice");

  if (data) {
    const inv = JSON.parse(data);

    setCustomer(inv.customer || "");
    setGstin(inv.gstin || "");
    setItems(JSON.parse(inv.description || "[]"));
    setGst(inv.gst || 0);
    setDiscount(inv.discount || 0);

    setEditingId(inv.id); // 🔥 IMPORTANT
  }
}, []);

  useEffect(() => {
    localStorage.setItem("shopName", shopName);
    localStorage.setItem("shopAddress", shopAddress);
    localStorage.setItem("contactDetails", contactDetails);
  }, [shopName, shopAddress, contactDetails]);

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
  // CALCULATIONS

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const gstAmount = (subtotal * gst) / 100;

  const total = subtotal + gstAmount - discount;
  const balanceDue = total - amountReceived;

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
    if (editingId) {
  // 🔥 UPDATE EXISTING
  const { error } = await supabase
  .from("invoices")
  .update({
  customer,
  gstin,

  description: JSON.stringify(items),

  gst,
  discount,

  subtotal,
  total,

  amount_received: amountReceived,
  balance_due: balanceDue,
})
  .eq("id", Number(editingId)); // 🔥 important

if (error) {
  console.log(error);
  alert("Update failed!");
  return;
}

alert("Invoice Updated!");
router.push("/history");
  
} else {
  // 🔥 CREATE NEW
  await supabase.from("invoices").insert([
  {
    customer,
    gstin,

    invoice_no: invoiceNo,

    description: JSON.stringify(items),

    subtotal,
    gst,
    discount,
    total,

    amount_received: amountReceived,
    balance_due: balanceDue,

    quantity: firstItem?.quantity || 0,
    price: firstItem?.price || 0,

    currency,

    shop_name: shopName,
    address: shopAddress,
    contact: contactDetails,
  },
]);

  alert("Invoice Saved!");
  
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
          <input
  type="text"
  placeholder="GSTIN"
  value={gstin}
  onChange={(e) => setGstin(e.target.value)}
  className="input"
/>
          
        </div>

        {/* CUSTOMER */}

        <select
  value={customer}
  onChange={(e) => {
    setCustomer(e.target.value);

    const selectedCustomer =
      customers.find(
        (c) =>
          c.customer_name === e.target.value
      );

    if (selectedCustomer) {
      setGstin(
        selectedCustomer.gstin || ""
      );
    }
  }}
  className="w-full p-3 border rounded mb-6"
>
  <option value="">
    Select Customer
  </option>

  {customers.map((c) => (
    <option
      key={c.id}
      value={c.customer_name}
    >
      {c.customer_name}
    </option>
  ))}
</select>

        {/* ITEMS */}

        {items.map((item, index) => (
          <div key={index} className="border p-4 mb-4 rounded">

            <select
  value={item.description}
  onChange={(e) => {
  const selected = products.find(
    (p) => p.product_name === e.target.value
  );

  const updatedItems = [...items];

  updatedItems[index] = {
    ...updatedItems[index],
    description: e.target.value,
    price: selected
      ? Number(selected.price)
      : updatedItems[index].price,
  };

  setItems(updatedItems);
}}
  className="w-full p-3 border rounded mb-3"
>
  <option value="">
    Select Product
  </option>

  {products.map((p) => (
    <option
      key={p.id}
      value={p.product_name}
    >
      {p.product_name}
    </option>
  ))}
</select>

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

        <label className="font-semibold block mb-1">
  GST %
</label>

<input
  type="number"
  value={gst}
  onChange={(e) => setGst(Number(e.target.value))}
  className="w-full p-3 border rounded mb-4"
/>

<label className="font-semibold block mb-1">
  Discount
</label>

<input
  type="number"
  value={discount}
  onChange={(e) => setDiscount(Number(e.target.value))}
  className="w-full p-3 border rounded mb-4"
/>

<label className="font-semibold block mb-1">
  Amount Received
</label>

<input
  type="number"
  value={amountReceived}
  onChange={(e) =>
    setAmountReceived(Number(e.target.value))
  }
  className="w-full p-3 border rounded mb-4"
/>

        {/* TOTALS */}

        <div className="bg-gray-100 p-6 rounded mb-6">

          <p>Subtotal: {currencyMap[currency]} {subtotal.toFixed(2)}</p>
          <p>GST ({gst}%): {currencyMap[currency]} {gstAmount.toFixed(2)}</p>
          <p>Discount: {currencyMap[currency]} {discount.toFixed(2)}</p>

          <hr className="my-3" />

          <p>
  Amount Received: {currencyMap[currency]}
  {" "}
  {amountReceived.toFixed(2)}
</p>

<p className="text-red-600 font-bold mt-2">
  Balance Due: {currencyMap[currency]}
  {" "}
  {balanceDue.toFixed(2)}
</p>

<hr className="my-3" />

<p className="text-2xl font-bold text-blue-700">
  Total: {currencyMap[currency]}
  {" "}
  {total.toFixed(2)}
</p>

        </div>

        <button
  onClick={saveInvoice}
  className="bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full"
>
  {editingId ? "Update Invoice" : "Save Invoice"}
</button>

      </div>
    </main>
  );
}