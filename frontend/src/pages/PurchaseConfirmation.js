// src/pages/PurchaseConfirmation.js

import React, { useEffect, useState } from "react";
import { InfoModal, ConfirmModal } from "../components/CustomModal";
import AddFundsModal from "../components/AddFundsModal";

const PurchaseConfirmation = () => {
  const [sales, setSales] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для модалок
  const [activeSale, setActiveSale] = useState(null); // какая запись сейчас «в обработке»
  const [actionType, setActionType] = useState(""); // "confirm" или "cancel"
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: "", message: "" });
  const [showAddFunds, setShowAddFunds] = useState(false);

  // Загружаем список ожидающих подтверждений
  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/content/ads/confirmation`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      // Отфильтруем сразу те, которые уже canceled или confirmed, если они всё ещё приходят.
      const filtered = data.filter((s) => !s.purchase_canceled && !s.status_purchase);
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

  // Функция для финального запроса при нажатии Confirm или Cancel
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
          // Cancel
          setInfoModalData({
            title: "Transaction Canceled",
            message: "Your purchase has been canceled and the funds were refunded to your account.",
          });
          // сразу удаляем из списка
          setSales((prev) => prev.filter((s) => s.id !== saleId));
        }
        setShowInfoModal(true);
      } else {
        const body = await res.json().catch(() => ({}));
        if (res.status === 400 && body.error === "not enough money") {
          // Недостаточно средств → показываем AddFundsModal
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

  // Когда пользователь нажал «Confirm» или «Cancel», открываем ConfirmModal
  const onClickAction = (sale, type) => {
    setActiveSale(sale);
    setActionType(type); // "confirm" или "cancel"
    setShowConfirmModal(true);
  };

  if (loading) return <p className="text-center py-5">Loading…</p>;
  if (error) return <p className="text-danger text-center py-5">{error.message}</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Purchase Confirmations</h2>
      {sales.length === 0 ? (
        <p>You have no pending transactions to confirm.</p>
      ) : (
        <div className="list-group">
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
                  Seller: {sale.seller_id.name} (ID {sale.seller_id.id})<br />
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

      {/* ConfirmModal: спрашиваем ещё раз, действительно ли Confirm или Cancel */}
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

      {/* Информационный модал после успешного Confirm/Cancel */}
      {showInfoModal && (
        <InfoModal
          title={infoModalData.title}
          message={infoModalData.message}
          onClose={() => {
            setShowInfoModal(false);
            // если это был Confirm, можно сразу обновить весь список:
            if (infoModalData.title === "Transaction Confirmed") {
              fetchSales();
            }
          }}
        />
      )}

      {/* Если недостаточно средств, открываем AddFundsModal */}
      {showAddFunds && (
        <AddFundsModal
          userId={/* допустим, ваш id берётся из контекста */ 0} // замените на реальный user.id
          onSuccess={(newBalance, isSubscribed) => {
            // обновляем контекст, если нужно
            setShowAddFunds(false);
          }}
          onError={(msg) => {
            console.error(msg);
            setShowAddFunds(false);
          }}
          onClose={() => setShowAddFunds(false)}
        />
      )}
    </div>
  );
};

export default PurchaseConfirmation;
