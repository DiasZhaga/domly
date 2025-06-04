// src/components/AddFundsModal.js

import React, { useState } from "react";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import stripePromise from "../stripe";

const AddFundsForm = ({ userId, onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState("");
  const [internalError, setInternalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setInternalError("");
    if (onError) onError("");

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      const msg = "Please enter an amount greater than zero";
      setInternalError(msg);
      if (onError) onError(msg);
      return;
    }
    if (!stripe || !elements) {
      const msg = "Stripe is not ready yet. Please wait.";
      setInternalError(msg);
      if (onError) onError(msg);
      return;
    }

    setLoading(true);
    try {
      // 1) Запрос client_secret
      const res = await fetch("/api/v1/payments/topup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error || `Server error ${res.status}`;
        throw new Error(msg);
      }
      const { client_secret: clientSecret } = await res.json();

      // 2) Получаем CardElement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        const msg = "Card input not found";
        throw new Error(msg);
      }

      // 3) Подтверждаем платёж
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (stripeError) {
        throw new Error(stripeError.message || "Error confirming payment");
      }

      // ** А теперь НЕ ждём fetch("/auth/me") внутри модалки, **
      // ** а сразу закрываем форму и вызываем onSuccess() **
      //   (родитель обновит баланс асинхронно, без блокировок)
      if (onSuccess) onSuccess();  
      onClose(); 

      // 4) Параллельно (не дожидаясь модалки) обновляем контекст:
      //    получаем новый баланс
      try {
        await new Promise((r) => setTimeout(r, 1500)); // чтобы вебхук успел сработать
        const updated = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (updated.ok) {
          const updatedUser = await updated.json();
          // передаём обратно в родителя точный баланс и флаг подписки
          if (onSuccess) onSuccess(updatedUser.balance, updatedUser.isSubscribed);
        }
      } catch (e2) {
        // если здесь что-то упало — просто проигнорируем (баланс всё равно обновится при следующей загрузке страницы)
        console.warn("Unable to fetch updated profile:", e2);
      }

    } catch (err) {
      console.error(err);
      const msg = err.message || "Payment failed";
      setInternalError(msg);
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="mb-3">Add Funds</h2>

      {internalError && <div className="alert alert-danger">{internalError}</div>}

      <div className="mb-3">
        <label className="form-label">Amount (₸)</label>
        <input
          type="number"
          className="form-control"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="1"
          required
          placeholder="Enter amount"
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Card Information</label>
        <div className="card p-2">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Pay"}
        </button>
      </div>
    </form>
  );
};

const AddFundsModal = ({ userId, onSuccess, onError, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <Elements stripe={stripePromise}>
        <AddFundsForm
          userId={userId}
          onSuccess={onSuccess}
          onError={onError}
          onClose={onClose}
        />
      </Elements>
    </div>
  </div>
);

export default AddFundsModal;
