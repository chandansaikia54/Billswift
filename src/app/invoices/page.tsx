"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InvoicesPage() {

  // ITEMS

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      price: 0,
    },
  ]);

  // OTHER STATES

  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(18);
  const [currency, setCurrency] = useState("INR");

  const [shopName, setShopName] = useState("Shop Name");
  const [shopAddress, setShopAddress] = useState("Address");
  const [contactDetails, setContactDetails] = useState("Phone No.");

  const [editId, setEditId] = useState<any>(null);

  // CURRENCY

  const currencyMap: any = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  // LOAD BUSINESS DETAILS

  useEffect(() => {
    const savedShop = localStorage.getItem("shopName");
    const savedAddress = localStorage.getItem("shopAddress");
    const savedContact = localStorage.getItem("contactDetails");

    if (savedShop) setShopName(savedShop);
    if (savedAddress) setShopAddress(savedAddress);
    if (savedContact) setContactDetails(savedContact);
  }, []);

  // SAVE BUSINESS DETAILS

  useEffect(() => {
    localStorage.setItem("shopName", shopName);
    localStorage.setItem("shopAddress", shopAddress);
    localStorage.setItem("contactDetails", contactDetails);
  }, [shopName, shopAddress, contactDetails]);

  // TOTAL

  const subtotal = items.reduce(
  (acc, item) =>
    acc + item.quantity * item.price,
  0
);

const gstAmount =
  (subtotal * gst) / 100;

const total =
  subtotal + gstAmount - discount;

  // UPDATE ITEM

  const updateItem = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
  };

  // ADD ITEM

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  // REMOVE ITEM

  const removeItem = (index: number) => {
    const updatedItems = items.filter(
      (_, i) => i !== index
    );

    setItems(updatedItems);
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
          description:
            JSON.stringify(items),

            subtotal,

            gst,

          quantity:
            firstItem.quantity,

          price:
            firstItem.price,

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

      setItems([
        {
          description: "",
          quantity: 1,
          price: 0,
        },
      ]);

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

        <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 mb-8">

          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Business Details
          </h2>

          <div className="grid gap-4">

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Shop Name
              </label>

              <input
                type="text"
                value={shopName}
                onChange={(e) =>
                  setShopName(e.target.value)
                }
                className="w-full p-3 border rounded text-black bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Address
              </label>

              <input
                type="text"
                value={shopAddress}
                onChange={(e) =>
                  setShopAddress(e.target.value)
                }
                className="w-full p-3 border rounded text-black bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Contact Details
              </label>

              <input
                type="text"
                value={contactDetails}
                onChange={(e) =>
                  setContactDetails(e.target.value)
                }
                className="w-full p-3 border rounded text-black bg-white"
              />
            </div>

          </div>
        </div>

        {/* CUSTOMER */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold text-gray-700">
            Customer Name
          </label>

          <input
            type="text"
            value={customer}
            onChange={(e) =>
              setCustomer(e.target.value)
            }
            className="w-full p-3 border rounded text-black bg-white"
          />
        </div>

        {/* ITEMS */}

        <div className="mb-8">

          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Invoice Items
          </h2>

          {items.map((item, index) => (

            <div
              key={index}
              className="border rounded-xl p-4 mb-4 bg-gray-50"
            >

              <div className="mb-4">

                <label className="block mb-2 font-semibold text-gray-700">
                  Item Description
                </label>

                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border rounded text-black bg-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <div>

                  <label className="block mb-2 font-semibold text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-3 border rounded text-black bg-white"
                  />
                </div>

                <div>

                  <label className="block mb-2 font-semibold text-gray-700">
                    Price
                  </label>

                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-3 border rounded text-black bg-white"
                  />
                </div>

              </div>

              <div className="flex justify-between items-center mt-4">

                <p className="font-bold text-blue-700">
                  Item Total: {currencyMap[currency]}{" "}
                  {item.quantity * item.price}
                </p>

                {items.length > 1 && (
                  <button
                    onClick={() =>
                      removeItem(index)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Remove
                  </button>
                )}

              </div>

            </div>
          ))}

          {/* ADD ITEM BUTTON */}

          <button
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            + Add Item
          </button>

        </div>
{/* GST */}

<div className="mb-6">

  <label className="block mb-2 font-semibold text-gray-700">
    GST / Tax (%)
  </label>

  <input
    type="number"
    value={gst}
    onChange={(e) =>
      setGst(Number(e.target.value))
    }
    className="w-full p-3 border rounded text-black bg-white"
  />
</div>

        {/* DISCOUNT */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold text-gray-700">
            Discount
          </label>

          <input
            type="number"
            value={discount}
            onChange={(e) =>
              setDiscount(Number(e.target.value))
            }
            className="w-full p-3 border rounded text-black bg-white"
          />
        </div>

        {/* CURRENCY */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold text-gray-700">
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
            className="w-full p-3 border rounded text-black bg-white"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>

        </div>

        {/* TOTALS */}

        <div className="bg-gray-50 p-6 rounded-xl mb-6 border">

          <p className="text-lg mb-2">
            Subtotal:{" "}
            <span className="font-bold">
              {currencyMap[currency]} {subtotal}
            </span>
          </p>

          <p className="text-lg mb-2">
            Discount:{" "}
            <span className="font-bold">
              {currencyMap[currency]} {discount}
            </span>
          </p>

          {/* TOTALS */}

<div className="bg-gray-50 p-6 rounded-xl mb-6 border">

  <p className="text-lg mb-3">
    Subtotal:{" "}
    <span className="font-bold">
      {currencyMap[currency]} {subtotal.toFixed(2)}
    </span>
  </p>

  <p className="text-lg mb-3">
    GST / Tax ({gst}%):{" "}
    <span className="font-bold">
      {currencyMap[currency]} {gstAmount.toFixed(2)}
    </span>
  </p>

  <p className="text-lg mb-3">
    Discount:{" "}
    <span className="font-bold">
      {currencyMap[currency]} {discount.toFixed(2)}
    </span>
  </p>

  <hr className="my-4" />

  <p className="text-3xl font-bold text-blue-700">
    Grand Total:{" "}
    {currencyMap[currency]} {total.toFixed(2)}
  </p>

</div>

        </div>

        {/* SAVE BUTTON */}

        <button
          onClick={saveInvoice}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-xl text-lg font-semibold"
        >
          Save Invoice
        </button>

      </div>

    </main>
  );
}