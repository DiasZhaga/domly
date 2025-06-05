// src/pages/AccountPayments.js

import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../components/AuthContext";
import AddFundsModal from "../components/AddFundsModal";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// PurchaseConfirmation теперь НЕ содержит <Layout>, а только внутренний контейнер
import PurchaseConfirmation from "./PurchaseConfirmation";

const AccountPayments = () => {
  const { user, setUser, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Баннеры об успехе/ошибке пополнения
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h4>Loading account info...</h4>
        </div>
      </Layout>
    );
  }

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
                  <p className="h5 text-success">₸{balanceToShow.toLocaleString()}</p>
                </div>
                <div className="col">
                  <h6>Subscription Status</h6>
                  <p className="h5">{user.isSubscribed ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          {/*  Здесь мы рендерим PurchaseConfirmation вместо Payment History  */}
          <PurchaseConfirmation />
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
