// src/pages/AccountPayments.js

import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../components/AuthContext";
import AddFundsModal from "../components/AddFundsModal";
import PurchaseConfirmation from "./PurchaseConfirmation";
import SalesHistory from "./SalesHistory";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AccountPayments = () => {
  const { user, setUser, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Баннеры об успехе/ошибке пополнения
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Состояние для истории покупок (completed / canceled)
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // ── Состояние для активной вкладки: "purchases" или "sales" ──
  const [activeTab, setActiveTab] = useState("purchases");
  // ────────────────────────────────────────────────────────────

  // ── useEffect для загрузки истории покупок ────────────────────
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setHistoryLoading(false);
      setHistoryError(null);
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await fetch("/api/v1/content/ads/confirmation", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        let data = await res.json();
        if (!Array.isArray(data)) data = [];

        // Фильтруем: только completed или canceled сделки
        const filtered = data.filter(
          (s) => s.status_purchase === true || s.purchase_cancelled === true
        );
        setHistory(filtered);
      } catch (err) {
        console.error(err);
        setHistoryError(err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);
  // ────────────────────────────────────────────────────────────

  // Пока данные о пользователе грузятся
  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h4>Loading account info...</h4>
        </div>
      </Layout>
    );
  }

  // Если пользователь не авторизован
  if (!user) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h4>Please log in to view your account.</h4>
        </div>
      </Layout>
    );
  }

  const balanceToShow = user.balance ?? 0;

  // Обработчики «Add Funds»
  const handleAddFundsSuccess = (newBalance, isSubscribed = null) => {
    if (typeof newBalance === "number") {
      setUser({
        ...user,
        balance: newBalance,
        isSubscribed: isSubscribed ?? user.isSubscribed,
      });
    }
    setShowModal(false);
    setSuccessMsg("Account topped up successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
  const handleAddFundsError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container py-5">
          {/* Баннеры об успехе/ошибке пополнения */}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <FaCheckCircle className="me-2" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <FaTimesCircle className="me-2" />
              {errorMsg}
            </div>
          )}

          {/* Карточка Account & Payments */}
          <div className="card shadow-sm rounded mb-5">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">Account &amp; Payments</h4>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setShowModal(true);
                  }}
                >
                  Add Funds
                </button>
              </div>
              <p className="mb-1">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="mb-4">
                <strong>Contact:</strong> {user.email}
              </p>
              <div className="row text-center">
                <div className="col">
                  <h6>Account Balance</h6>
                  <p className="h5 text-success">₸{balanceToShow.toLocaleString("ru-RU")}</p>
                </div>
                <div className="col">
                  <h6>Subscription Status</h6>
                  <p className="h5">{user.isSubscribed ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Навигация между вкладками “Purchases” и “Sales” ── */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "purchases" ? "active" : ""}`}
                onClick={() => setActiveTab("purchases")}
              >
                Purchases
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "sales" ? "active" : ""}`}
                onClick={() => setActiveTab("sales")}
              >
                Sales
              </button>
            </li>
          </ul>
          {/* ──────────────────────────────────────────────────── */}

          {/* ── Контент вкладки “Purchases” ── */}
          {activeTab === "purchases" && (
            <>
              {/* Раздел Purchase Confirmations */}
              <PurchaseConfirmation />

              {/* Раздел Purchase History */}
              <div className="mt-5">
                <h2 className="mb-4">Purchase History</h2>

                {historyLoading ? (
                  <p className="text-center py-3">Loading history…</p>
                ) : historyError ? (
                  <p className="text-danger text-center py-3">
                    {historyError.message || "Failed to load history"}
                  </p>
                ) : !Array.isArray(history) || history.length === 0 ? (
                  <p className="text-center py-3">
                    No completed or canceled transactions yet.
                  </p>
                ) : (
                  <div className="list-group">
                    {history.map((sale) => {
                      const isConfirmed = sale.status_purchase === true;
                      const isCanceled = sale.purchase_cancelled === true;
                      const statusLabel = isConfirmed
                        ? { text: "Completed", className: "text-success" }
                        : { text: "Canceled", className: "text-danger" };

                      return (
                        <div
                          key={sale.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-bold">
                              Listing ID: {sale.id_ads} — Amount: ₸
                              {Number(sale.purchase_amount).toLocaleString("ru-RU")}
                            </div>
                            <small>
                              Seller: {sale.seller_id.name} (ID {sale.seller_id.id})
                              <br />
                              {isConfirmed && (
                                <>
                                  <span>Confirmed on: </span>
                                  <span>
                                    {new Date(
                                      sale.confirmation_waiting_date
                                    ).toLocaleDateString("ru-RU")}
                                  </span>
                                  <br />
                                </>
                              )}
                              {isCanceled && (
                                <>
                                  <span>Canceled on: </span>
                                  <span>
                                    {new Date(
                                      sale.confirmation_waiting_date
                                    ).toLocaleDateString("ru-RU")}
                                  </span>
                                  <br />
                                </>
                              )}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            {isConfirmed ? (
                              <FaCheckCircle className="fs-4 text-success me-1" />
                            ) : (
                              <FaTimesCircle className="fs-4 text-danger me-1" />
                            )}
                            <span className={statusLabel.className}>
                              {statusLabel.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
          {/* ──────────────────────────────────────────────────── */}

          {/* ── Контент вкладки “Sales” ── */}
          {activeTab === "sales" && (
            <>
        
              <SalesHistory />
            </>
          )}
          {/* ──────────────────────────────────────────────────── */}

        </div>
      </div>

      {/* Modal “Add Funds” */}
      {showModal && (
        <AddFundsModal
          userId={user.id}
          onSuccess={handleAddFundsSuccess}
          onError={handleAddFundsError}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  );
};

export default AccountPayments;
