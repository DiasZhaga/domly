// src/pages/SubscriptionPlans.js

import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../components/AuthContext";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Настройка плана (остается без изменений)
const plans = [
  {
    key: "plus",
    id: "1",
    name: "Domly Plus",
    price: 8000,
    period: "1 month",
  },
  {
    key: "ultra",
    id: "2",
    name: "Domly Ultra",
    price: 30000,
    period: "6 months",
  },
];

const SubscriptionPlans = () => {
  const { user, setUser, loading } = useAuth();

  // Для сообщений об ошибке / успехе:
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Флаг, что идёт запрос на покупку (блокирует кнопки)
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Управление модалкой подтверждения:
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // 1) Пока идёт загрузка user (fetch("/api/v1/auth/me")), показываем «Loading…»
  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h4>Loading account info...</h4>
        </div>
      </Layout>
    );
  }

  // 2) Если пользователь не залогинен – показываем план, но покупку блокируем
  //    (мы убираем прежний return, и вообще рендерим всё окно для всех).
  //    Кнопки «Subscribe» будут неактивны и показывать сообщение «Log in to buy».

  // 3) Открыть модалку подтверждения для конкретного плана
  const openConfirmModal = (plan) => {
    if (!user) {
      // незалогиненный – нельзя купить, покажем краткую ошибку
      setError("Please log in to purchase a subscription.");
      return;
    }
    setError("");
    setSuccess("");
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  // 4) Подтвердить покупку: сделать запрос к API и обновить user
  const confirmPurchase = async () => {
    if (!selectedPlan) return;

    setError("");
    setSuccess("");
    setLoadingPlan(true);

    try {
      const res = await fetch(`/api/v1/subscribe/buy/${selectedPlan.id}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error || `Server returned ${res.status}`;
        throw new Error(msg);
      }

      const updatedUser = await res.json();
      // Обновляем контекст пользователя (баланс/статус подписки)
      setUser(updatedUser);

      setSuccess("Subscription purchased successfully.");

      // Закрываем модалку через 1 секунду
      setTimeout(() => {
        setShowConfirm(false);
        setSelectedPlan(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Purchase failed.");
    } finally {
      setLoadingPlan(false);
    }
  };

  // 5) Отмена покупки
  const cancelPurchase = () => {
    setShowConfirm(false);
    setSelectedPlan(null);
    setError("");
    setSuccess("");
    setLoadingPlan(false);
  };

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container py-5">
          <h2 className="text-center mb-4">Subscription Plans</h2>

          {/* Показываем общий alert об ошибке или об успехе */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <FaTimesCircle className="me-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <FaCheckCircle className="me-2" />
              {success}
            </div>
          )}

          <div className="row g-4">
            {plans.map((plan) => {
              // если пользователь не залогинен, кнопка будет disabled и при клике выводится «Please log in…»
              const isDisabled = loadingPlan || !user;

              return (
                <div className="col-md-6" key={plan.key}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-center">{plan.name}</h5>
                      <h3 className="text-success text-center mb-3">
                        ₸{plan.price.toLocaleString("en-US")}
                        <small className="text-muted"> / {plan.period}</small>
                      </h3>

                      <ul className="list-unstyled mb-4">
                        {plan.name === "Domly Plus" ? (
                          <>
                            <li className="mb-2">
                              <i className="fa fa-check me-2" />
                              View “What Locals Say” comments
                            </li>
                            <li className="mb-2">
                              <i className="fa fa-check me-2" />
                              Developer consultations
                            </li>
                            <li className="mb-2">
                              <i className="fa fa-check me-2" />
                              Your ads always appear at the top
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="mb-2">
                              <i className="fa fa-check me-2" />
                              All features of Domly Plus
                            </li>
                            <li className="mb-2">
                              <i className="fa fa-check me-2" />
                              Save ~38% vs. monthly plan
                            </li>
                          </>
                        )}
                      </ul>

                      <button
                        className="btn btn-success mt-auto"
                        onClick={() => openConfirmModal(plan)}
                        disabled={isDisabled}
                      >
                        {loadingPlan && selectedPlan?.id === plan.id
                          ? "Processing..."
                          : !user
                          ? "Log in to subscribe"
                          : `Subscribe to ${plan.name}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 bg-white rounded shadow-sm">
            <h4>What is Domly Premium?</h4>
            <p className="mb-3">Domly Premium provides:</p>
            <ul>
              <li>
                <strong>View “What Locals Say” comments:</strong> see real feedback
                from residents
              </li>
              <li>
                <strong>Developer consultations:</strong> get direct answers from
                builders
              </li>
              <li>
                <strong>Top listing priority:</strong> your ads always appear at
                the top
              </li>
            </ul>
            <p className="mt-3 mb-0">
              Gain full transparency and peace of mind when buying or selling real
              estate.
            </p>
          </div>
        </div>
      </div>

      {/* ------------- Confirmation Modal ------------- */}
      {showConfirm && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className="mb-3">Confirm Purchase</h5>
            <p>
              {`Do you really want to purchase a ${selectedPlan.period} subscription to `}
              <strong>{selectedPlan.name}</strong>
              {` for ₸${selectedPlan.price.toLocaleString("en-US")}?`}
            </p>

            {/* Повторим сообщения внутри модалки (если нужно) */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center">
                <FaTimesCircle className="me-2" />
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success d-flex align-items-center">
                <FaCheckCircle className="me-2" />
                {success}
              </div>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={cancelPurchase}
                disabled={loadingPlan}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmPurchase}
                disabled={loadingPlan}
              >
                {loadingPlan ? "Processing..." : "Buy"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --------- End Confirmation Modal --------- */}
    </Layout>
  );
};

export default SubscriptionPlans;
