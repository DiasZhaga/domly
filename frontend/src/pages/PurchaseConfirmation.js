// src/pages/PurchaseConfirmation.js

import React, { useEffect, useState } from "react";
import { InfoModal, ConfirmModal } from "../components/CustomModal";
import AddFundsModal from "../components/AddFundsModal";
import { useNavigate } from "react-router-dom";


const PurchaseConfirmation = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для модалок
  const [activeSale, setActiveSale] = useState(null);
  const [actionType, setActionType] = useState(""); // "confirm" или "cancel"
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: "", message: "" });
  const [showAddFunds, setShowAddFunds] = useState(false);

  const navigate = useNavigate();

  // Загружаем список ожидающих подтверждений
  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/content/ads/confirmation`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // Фильтруем только те, которые ещё не canceled и не confirmed
      const filtered = data.filter(
        (s) => !s.purchase_cancelled && !s.status_purchase
      );
      setSales(filtered);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Отправка финального запроса при Confirm/Cancel
  const performAction = async () => {
    if (!activeSale || !actionType) return;

    const saleId = activeSale.id;
    const sellerId = activeSale.seller_id.id;
    const sum = activeSale.purchase_amount;

    try {
      const res = await fetch(
        `/api/v1/content/ads/buy/confirmation/${saleId}?status=${
          actionType === "confirm" ? "true" : "false"
        }&seller_id=${sellerId}&sum=${sum}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (res.ok) {
        if (actionType === "confirm") {
          setInfoModalData({
            title: "Transaction Confirmed",
            message: "Your purchase has been confirmed and the funds were released to the seller.",
          });
        } else {
          setInfoModalData({
            title: "Transaction Canceled",
            message: "Your purchase has been canceled and the funds were refunded to your account.",
          });
          setSales((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== saleId) : []));
        }
        setShowInfoModal(true);
      } else {
        const body = await res.json().catch(() => ({}));
        if (res.status === 400 && body.error === "not enough money") {
          setShowAddFunds(true);
        } else {
          throw new Error(body.error || "Request failed");
        }
      }
    } catch (e) {
      console.error(e);
      setInfoModalData({
        title: "Error",
        message: e.message || "Unknown error occurred",
      });
      setShowInfoModal(true);
    } finally {
      setShowConfirmModal(false);
      setActiveSale(null);
      setActionType("");
    }
  };

  // Когда пользователь нажал «Confirm» или «Cancel»
  const onClickAction = (sale, type) => {
    setActiveSale(sale);
    setActionType(type);
    setShowConfirmModal(true);
  };

  return (
    <>
      
      <h2 className="mb-4">Purchase Confirmations</h2>

      {loading ? (
        <p className="text-center py-3">Loading…</p>
      ) : error ? (
        <p className="text-danger text-center py-3">{error.message}</p>
      ) : !Array.isArray(sales) || sales.length === 0 ? (
        <p className="text-center py-3">You have no pending transactions to confirm.</p>
      ) : (
        <div className="list-group mb-5">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">
                  Listing ID: {sale.id_ads} — Amount: ₸
                  {Number(sale.purchase_amount).toLocaleString("ru-RU")}
                </div>
                <small>
                  Seller: {sale.seller_id.name} (ID {sale.seller_id.id})
                  <br />
                  Confirmation due by:{" "}
                  {new Date(sale.confirmation_waiting_date).toLocaleDateString("ru-RU")}
                </small>
              </div>
              <div className="btn-group" role="group">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onClickAction(sale, "confirm")}
                >
                  Confirm
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onClickAction(sale, "cancel")}
                >
                  Cancel
                </button>
              </div>
            </div> 
          ))}
        </div>
      )}

      {/* ConfirmModal */}
      {showConfirmModal && (
        <ConfirmModal
          title={actionType === "confirm" ? "Confirm Purchase" : "Cancel Purchase"}
          message={
            actionType === "confirm"
              ? "Are you sure you want to confirm this transaction? Once confirmed, the funds will be released to the seller."
              : "Are you sure you want to cancel this transaction? Once canceled, the funds will be refunded to your account."
          }
          confirmLabel={actionType === "confirm" ? "Yes, Confirm" : "Yes, Cancel"}
          cancelLabel="No"
          onCancel={() => {
            setShowConfirmModal(false);
            setActiveSale(null);
            setActionType("");
          }}
          onConfirm={performAction}
        />
      )}

      {/* InfoModal после Confirm/Cancel */}
      {showInfoModal && (
        <InfoModal
          title={infoModalData.title}
          message={infoModalData.message}
          onClose={() => {
            setShowInfoModal(false);
            navigate("/account-payments");
          }}
        />
      )}

      {/* Если недостаточно средств, AddFundsModal */}
      {showAddFunds && (
        <AddFundsModal
          userId={0} // замените на реальный user.id
          onSuccess={() => setShowAddFunds(false)}
          onError={() => setShowAddFunds(false)}
          onClose={() => setShowAddFunds(false)}
        />
        
      )}
    </>
    
  );
};

export default PurchaseConfirmation;
