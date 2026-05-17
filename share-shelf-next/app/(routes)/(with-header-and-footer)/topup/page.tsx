"use client";

import { axios } from "@/app/lib";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const getAppUrl = () =>
  (
    process.env.NEXT_PUBLIC_SHARE_SHELF_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");

function TopupContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");
  const initialAmount = searchParams.get("amount");
  const appUrl = getAppUrl();

  const [form, setForm] = useState({
    amount: initialAmount || "100",
    tax_amount: "0",
    transaction_uuid: "",
    success_url: purchaseId
      ? `${appUrl}/topup/success?purchaseId=${purchaseId}`
      : `${appUrl}/topup/success`,
    failure_url: purchaseId
      ? `${appUrl}/topup/failure?purchaseId=${purchaseId}`
      : `${appUrl}/topup/failure`,
  });
  const [paymentConfig, setPaymentConfig] = useState({
    product_code: "",
    gateway_url: "",
    signed_field_names: "",
    signature: "",
  });
  const [signatureError, setSignatureError] = useState("");

  const total_amount = (Number(form.amount) + Number(form.tax_amount)).toFixed(
    2,
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      transaction_uuid: crypto.randomUUID(),
    }));
  }, []);

  useEffect(() => {
    const baseUrl = getAppUrl();

    setForm((prev) => ({
      ...prev,
      success_url: purchaseId
        ? `${baseUrl}/topup/success?purchaseId=${purchaseId}`
        : `${baseUrl}/topup/success`,
      failure_url: purchaseId
        ? `${baseUrl}/topup/failure?purchaseId=${purchaseId}`
        : `${baseUrl}/topup/failure`,
    }));
  }, [purchaseId]);

  useEffect(() => {
    if (!form.transaction_uuid) return;

    let cancelled = false;

    const loadSignature = async () => {
      try {
        setSignatureError("");
        const { data } = await axios.post("/topup/signature", {
          total_amount,
          transaction_uuid: form.transaction_uuid,
        });

        if (!cancelled) {
          setPaymentConfig(data);
        }
      } catch (error: any) {
        if (!cancelled) {
          setPaymentConfig({
            product_code: "",
            gateway_url: "",
            signed_field_names: "",
            signature: "",
          });
          setSignatureError(
            error?.response?.data?.message || "Unable to prepare eSewa payment",
          );
        }
      }
    };

    void loadSignature();

    return () => {
      cancelled = true;
    };
  }, [form.transaction_uuid, total_amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">
          {purchaseId ? "Confirm Purchase Payment" : "eSewa Top-Up"}
        </h1>
        {purchaseId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            You are paying for a book purchase. The amount is fixed at Rs.{" "}
            {initialAmount}.
          </div>
        )}
        <div className="space-y-4 mb-6">
          <Input
            label="Amount (Rs)"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            disabled={!!purchaseId}
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
        {signatureError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {signatureError}
          </p>
        )}

        {/* eSewa Form */}
        <form
          method="POST"
          action={paymentConfig.gateway_url}
        >
          <input type="hidden" name="amount" value={form.amount} />
          <input type="hidden" name="tax_amount" value={form.tax_amount} />
          <input type="hidden" name="total_amount" value={total_amount} />
          <input
            type="hidden"
            name="transaction_uuid"
            value={form.transaction_uuid}
          />
          <input type="hidden" name="product_code" value={paymentConfig.product_code} />
          <input type="hidden" name="product_service_charge" value="0" />
          <input type="hidden" name="product_delivery_charge" value="0" />
          <input type="hidden" name="success_url" value={form.success_url} />
          <input type="hidden" name="failure_url" value={form.failure_url} />
          <input
            type="hidden"
            name="signed_field_names"
            value={paymentConfig.signed_field_names}
          />
          <input type="hidden" name="signature" value={paymentConfig.signature} />

          <button
            type="submit"
            disabled={!paymentConfig.signature || !paymentConfig.gateway_url}
            className="w-full bg-[#FF8D28] disabled:bg-gray-300 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Pay with eSewa
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Topup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <TopupContent />
    </Suspense>
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
