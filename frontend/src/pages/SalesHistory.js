// src/pages/SalesHistory.js

import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/content/ads/seller-history", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];

        // Никакой дополнительной фильтрации не нужно:
        // вернулись все сделки продавца (pending, completed, canceled).
        setSales(data);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <p className="text-center py-3">Loading sales…</p>;
  if (error) return <p className="text-danger text-center py-3">{error.message}</p>;
  if (!Array.isArray(sales) || sales.length === 0) {
    return <p className="text-center py-3">You have no sales yet.</p>;
  }

  return (
    <div className="mt-5">
      <h2 className="mb-4">Sales History</h2>
      <div className="list-group">
        {sales.map((sale) => {
          const isConfirmed = sale.status_purchase === true;
          const isCanceled = sale.purchase_cancelled === true;

          const statusLabel = isConfirmed
            ? { text: "Completed", className: "text-success" }
            : isCanceled
            ? { text: "Canceled", className: "text-danger" }
            : { text: "Pending", className: "text-warning" };

          return (
            <div
              key={sale.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-bold">
                  Listing ID: {sale.id_ads} — Sale Amount: ₸
                  {Number(sale.purchase_amount).toLocaleString("ru-RU")}
                </div>
                <small>
                  Buyer: {sale.buyer_id.name} (ID {sale.buyer_id.id})
                  <br />
                  {statusLabel.text === "Pending" && (
                    <>
                      <span>Waiting for buyer to confirm until: </span>
                      <span>
                        {new Date(sale.confirmation_waiting_date).toLocaleDateString(
                          "ru-RU"
                        )}
                      </span>
                      <br />
                    </>
                  )}
                  {isConfirmed && (
                    <>
                      <span>Confirmed on: </span>
                      <span>
                        {new Date(sale.confirmation_waiting_date).toLocaleDateString(
                          "ru-RU"
                        )}
                      </span>
                      <br />
                    </>
                  )}
                  {isCanceled && (
                    <>
                      <span>Canceled on: </span>
                      <span>
                        {new Date(sale.confirmation_waiting_date).toLocaleDateString(
                          "ru-RU"
                        )}
                      </span>
                      <br />
                    </>
                  )}
                </small>
              </div>
              <div className="d-flex align-items-center">
                {isConfirmed ? (
                  <FaCheckCircle className="fs-4 text-success me-1" />
                ) : isCanceled ? (
                  <FaTimesCircle className="fs-4 text-danger me-1" />
                ) : (
                  <span className="fs-5 text-warning me-1">⏳</span>
                )}
                <span className={statusLabel.className}>{statusLabel.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesHistory;
