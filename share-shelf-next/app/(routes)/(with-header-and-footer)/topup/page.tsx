"use client";

import CryptoJS from "crypto-js";
import { useEffect, useMemo, useState } from "react";

export default function Topup() {
  const [form, setForm] = useState({
    amount: "100",
    tax_amount: "0",
    transaction_uuid: "21",
    product_code: "EPAYTEST",
    success_url: "http://localhost:3001/topup/success",
    failure_url: "http://localhost:3001/topup/failure",
  });

  const total_amount = (Number(form.amount) + Number(form.tax_amount)).toFixed(
    2,
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      transaction_uuid: crypto.randomUUID(),
    }));
  }, []);

  const signed_field_names = "total_amount,transaction_uuid,product_code";

  const signature = useMemo(() => {
    if (!form.transaction_uuid) return "";

    const message =
      `total_amount=${total_amount},` +
      `transaction_uuid=${form.transaction_uuid},` +
      `product_code=${form.product_code}`;

    const secret = "8gBm/:&EnhH.1/q";
    const hash = CryptoJS.HmacSHA256(message, secret);

    return CryptoJS.enc.Base64.stringify(hash);
  }, [form.transaction_uuid, form.product_code, total_amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">eSewa Top-Up</h1>
        <div className="space-y-4 mb-6">
          <Input
            label="Amount (Rs)"
            name="amount"
            value={form.amount}
            onChange={handleChange}
          />
        </div>

        <div className="border rounded-xl p-4 mb-6 bg-gray-50">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-black">Total Amount</span>
            <span className="font-semibold text-green-600">
              Rs. {total_amount}
            </span>
          </div>
        </div>

        {/* eSewa Form */}
        <form
          method="POST"
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        >
          <input type="hidden" name="amount" value={form.amount} />
          <input type="hidden" name="tax_amount" value={form.tax_amount} />
          <input type="hidden" name="total_amount" value={total_amount} />
          <input
            type="hidden"
            name="transaction_uuid"
            value={form.transaction_uuid}
          />
          <input type="hidden" name="product_code" value={form.product_code} />
          <input type="hidden" name="product_service_charge" value="0" />
          <input type="hidden" name="product_delivery_charge" value="0" />
          <input type="hidden" name="success_url" value={form.success_url} />
          <input type="hidden" name="failure_url" value={form.failure_url} />
          <input
            type="hidden"
            name="signed_field_names"
            value={signed_field_names}
          />
          <input type="hidden" name="signature" value={signature} />

          <button
            type="submit"
            disabled={!signature}
            className="w-full bg-[#FF8D28] disabled:bg-gray-300 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Pay with eSewa
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8D28]"
      />
    </div>
  );
}
