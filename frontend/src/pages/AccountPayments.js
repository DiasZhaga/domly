// src/pages/AccountPayments.js

import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../components/AuthContext";
import AddFundsModal from "../components/AddFundsModal";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AccountPayments = () => {
  const { user, setUser, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Баннера для успеха/ошибки
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Если /auth/me ещё в процессе
  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h4>Loading account info...</h4>
        </div>
      </Layout>
    );
  }

  // Если не залогинен
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

  // Первый вызов onSuccess (без баланса) – просто закрывает модалку и ставит сообщение
  // Второй вызов onSuccess со значением newBalance → обновит контекст
  const handleAddFundsSuccess = (newBalance, isSubscribed = null) => {
    // Если newBalance передали – обновляем контекст
    if (typeof newBalance === "number") {
      setUser({ ...user, balance: newBalance, isSubscribed: isSubscribed ?? user.isSubscribed });
    }

    // Закрываем модалку, если она ещё открыта
    setShowModal(false);

    // Показываем зелёный баннер
    setSuccessMsg("Account topped up successfully");
    // Скрываем через 3 секунды
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
          {/* Зелёный баннер об успехе */}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <FaCheckCircle className="me-2" />
              {successMsg}
            </div>
          )}
          {/* Красный баннер об ошибке */}
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <FaTimesCircle className="me-2" />
              {errorMsg}
            </div>
          )}

          <div className="card shadow-sm rounded mb-5">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">Account &amp; Payments</h4>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    // Перед открытием модалки сбросим все старые сообщения
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
                  <p className="h5 text-success">
                    ₸{balanceToShow.toLocaleString()}
                  </p>
                </div>
                <div className="col">
                  <h6>Subscription Status</h6>
                  <p className="h5">{user.isSubscribed ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Заглушка Payment History */}
          <h5 className="mb-3">Payment History</h5>
          <div className="list-group mb-5">
            <div className="list-group-item d-flex justify-content-between align-items-center" key={1}>
              <div>
                <div className="fw-semibold">2025-05-28</div>
                <div className="text-muted">Domly Plus Subscription</div>
              </div>
              <div className="fw-bold">₸8 000</div>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center" key={2}>
              <div>
                <div className="fw-semibold">2025-04-15</div>
                <div className="text-muted">Domly Ultra 6-month Subscription</div>
              </div>
              <div className="fw-bold">₸30 000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка “Add Funds” */}
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
