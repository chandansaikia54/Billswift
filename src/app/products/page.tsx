"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");
  const [category, setCategory] = useState("");

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

  async function addProduct() {
    if (!productName) {
      alert("Enter product name");
      return;
    }

    const { error } = await supabase
      .from("products")
      .insert([
        {
          product_name: productName,
          price: Number(price || 0),
          gst: Number(gst || 0),
          category,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setProductName("");
    setPrice("");
    setGst("");
    setCategory("");

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete product?")) return;

    await supabase
      .from("products")
      .delete()
      .eq("id", id);

    fetchProducts();
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Product Master
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="GST %"
            value={gst}
            onChange={(e) => setGst(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          />

        </div>

        <button
          onClick={addProduct}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Product</th>
              <th className="text-left py-3">Price</th>
              <th className="text-left py-3">GST</th>
              <th className="text-left py-3">Category</th>
              <th className="text-left py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3">
                  {p.product_name}
                </td>

                <td>
                  ₹ {Number(p.price).toFixed(2)}
                </td>

                <td>
                  {p.gst}%
                </td>

                <td>
                  {p.category}
                </td>

                <td>
                  <button
                    onClick={() => deleteProduct(p.id)}
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