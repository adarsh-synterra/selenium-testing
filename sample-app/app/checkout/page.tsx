"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Stepper from "@/components/Stepper";
import type { PaymentDetails, Product, ShippingAddress } from "@/lib/types";

interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  product: Product | undefined;
}

interface CartResponse {
  items: CartLine[];
  subtotal: number;
}

const STEPS = ["Shipping", "Payment", "Review"];

const emptyShipping: ShippingAddress = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

const emptyPayment: PaymentDetails = {
  cardNumber: "",
  expiry: "",
  cvv: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [payment, setPayment] = useState<PaymentDetails>(emptyPayment);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/cart");
      const data: CartResponse = await res.json();
      setCart(data);
      setAuthChecked(true);
    })();
  }, [router]);

  function shippingValid(): boolean {
    return (
      shipping.fullName.trim() !== "" &&
      shipping.street.trim() !== "" &&
      shipping.city.trim() !== "" &&
      shipping.state.trim() !== "" &&
      shipping.zip.trim() !== "" &&
      shipping.country.trim() !== ""
    );
  }

  function paymentValid(): boolean {
    const digits = payment.cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;
    // Luhn
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    if (sum % 10 !== 0) return false;
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) return false;
    if (!/^\d{3,4}$/.test(payment.cvv)) return false;
    return true;
  }

  function goNext() {
    setError(null);
    if (step === 1) {
      if (!shippingValid()) {
        setError("Please fill out all shipping fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentValid()) {
        setError("Payment details are invalid. Card number must pass Luhn check, expiry MM/YY, CVV 3-4 digits.");
        return;
      }
      setStep(3);
    }
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function placeOrder() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping, payment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      router.refresh();
      router.push(`/orders/${data.order.id}`);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked || !cart) {
    return (
      <div data-testid="page-checkout">
        <p data-testid="loading">Loading checkout...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div data-testid="page-checkout" className="space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p data-testid="checkout-empty-cart" className="text-slate-600">
          Your cart is empty. Add something before checking out.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="page-checkout" className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <Stepper steps={STEPS} current={step} />

      {error && (
        <p
          data-testid="error-checkout"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {step === 1 && (
        <section
          data-testid="checkout-step-1"
          className="space-y-4 rounded border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Full name"
              testId="shipping-fullName"
              value={shipping.fullName}
              onChange={(v) => setShipping({ ...shipping, fullName: v })}
            />
            <Input
              label="Street"
              testId="shipping-street"
              value={shipping.street}
              onChange={(v) => setShipping({ ...shipping, street: v })}
            />
            <Input
              label="City"
              testId="shipping-city"
              value={shipping.city}
              onChange={(v) => setShipping({ ...shipping, city: v })}
            />
            <Input
              label="State / Region"
              testId="shipping-state"
              value={shipping.state}
              onChange={(v) => setShipping({ ...shipping, state: v })}
            />
            <Input
              label="ZIP / Postcode"
              testId="shipping-zip"
              value={shipping.zip}
              onChange={(v) => setShipping({ ...shipping, zip: v })}
            />
            <Input
              label="Country"
              testId="shipping-country"
              value={shipping.country}
              onChange={(v) => setShipping({ ...shipping, country: v })}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={goNext}
              data-testid="checkout-step-1-next"
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Next: Payment
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section
          data-testid="checkout-step-2"
          className="space-y-4 rounded border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Payment</h2>
          <p className="text-xs text-slate-500">
            Test number: <code>4242 4242 4242 4242</code>, any future expiry MM/YY, any 3-4 digit CVV.
          </p>
          <Input
            label="Card number"
            testId="payment-cardNumber"
            value={payment.cardNumber}
            onChange={(v) => setPayment({ ...payment, cardNumber: v })}
            placeholder="4242 4242 4242 4242"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Expiry (MM/YY)"
              testId="payment-expiry"
              value={payment.expiry}
              onChange={(v) => setPayment({ ...payment, expiry: v })}
              placeholder="12/29"
            />
            <Input
              label="CVV"
              testId="payment-cvv"
              value={payment.cvv}
              onChange={(v) => setPayment({ ...payment, cvv: v })}
              placeholder="123"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={goBack}
              data-testid="checkout-step-2-back"
              className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              onClick={goNext}
              data-testid="checkout-step-2-next"
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Next: Review
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section
          data-testid="checkout-step-3"
          className="space-y-4 rounded border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Review your order</h2>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Shipping to</h3>
            <p data-testid="review-shipping" className="text-sm text-slate-600">
              {shipping.fullName}, {shipping.street}, {shipping.city}, {shipping.state} {shipping.zip}, {shipping.country}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Payment</h3>
            <p data-testid="review-payment" className="text-sm text-slate-600">
              Card ending in {payment.cardNumber.replace(/\s+/g, "").slice(-4)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Items</h3>
            <ul data-testid="review-items" className="divide-y divide-slate-200">
              {cart.items.map((line) => (
                <li
                  key={line.id}
                  data-testid={`review-item-${line.id}`}
                  className="flex justify-between py-2 text-sm"
                >
                  <span>
                    {line.product?.name} &times; {line.quantity}
                  </span>
                  <span>
                    ${((line.product?.price ?? 0) * line.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold">Total</span>
            <span data-testid="review-total" className="font-semibold">
              ${cart.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <button
              onClick={goBack}
              data-testid="checkout-step-3-back"
              className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={submitting}
              data-testid="checkout-place-order"
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? (
                <span data-testid="loading">Placing order...</span>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function Input({
  label,
  testId,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  testId: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
      />
    </label>
  );
}
