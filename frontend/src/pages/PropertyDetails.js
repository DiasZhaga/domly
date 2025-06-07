// src/pages/PropertyDetails.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Layout from "../components/Layout";
import PropertyGallery from "../components/PropertyGallery";
import SignInModal from "../components/SignInModal";
import AddFundsModal from "../components/AddFundsModal";
import { ConfirmModal, InfoModal } from "../components/CustomModal";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---------------------------------
  // 1. Состояние для городов и районов
  // ---------------------------------
  const [citiesList, setCitiesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // ---------------------------------
  // 2. Состояние для самого объявления
  // ---------------------------------
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------
  // 3. Состояние для модалок
  // ---------------------------------
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: "", message: "" });
  const [showAddFunds, setShowAddFunds] = useState(false);

  const isGuest = !user;
  const needsSubscription = user && !user.isSubscribed;

  // ---------------------------------
  // 4. Моковые комментарии
  // ---------------------------------
  const comments = [
    {
      id: 1,
      author: "Erzhan Zhumagaliev",
      text: "Very friendly community, everything is near by, supermarket, laundry mats. Pharmacy and playground. Buss to the subway",
      time: "just now",
    },
  ];

  // ---------------------------------
  // 5. Загрузка списка городов
  // ---------------------------------
  useEffect(() => {
    fetch("/api/v1/locations/cities", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCitiesList(data);
      })
      .catch(console.error);
  }, []);

  // ---------------------------------
  // 6. Загрузка самого объявления
  // ---------------------------------
  useEffect(() => {
    const loadAd = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/content/ads/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();
        setAd(json);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [id]);

  // ---------------------------------
  // 7. Когда объявление загружено, подгружаем районы для его города
  // ---------------------------------
  useEffect(() => {
    if (!ad || !ad.city) return;

    fetch(`/api/v1/locations/districts?city_id=${ad.city}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setDistrictsList(data);
      })
      .catch(console.error);
  }, [ad]);

  if (loading) return <p className="text-center py-5">Loading…</p>;
  if (error) return <p className="text-danger text-center py-5">{error.message}</p>;
  if (!ad) return <p className="text-center py-5">No data</p>;

  // ---------------------------------
  // 8. URL фотографий для PropertyGallery
  // ---------------------------------
  const photoUrls = (ad.url_photos || []).map((p) =>
    p.url.startsWith("http") ? p.url : `/ads-photos/${p.url}`
  );

  const startChat = () => {
    if (ad.author?.id) {
      navigate(`/messages?user2=${ad.author.id}`);
    }
  };

  // ---------------------------------
  // 9. Вычисляем читабельные имена города и района
  // ---------------------------------
  const cityName = (() => {
    const cityIdNum = Number(ad.city);
    const found = citiesList.find((c) => c.id === cityIdNum);
    return found ? found.name : ad.city;
  })();

  const districtName = (() => {
    const districtIdNum = Number(ad.district);
    const found = districtsList.find((d) => d.id === districtIdNum);
    return found ? found.name : ad.district;
  })();

  // ---------------------------------
  // 10. Функция покупки
  // ---------------------------------
  const performPurchase = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const apartmentId = ad.id;
    const sellerId = ad.author.id;
    const sum = ad.price;

    try {
      const res = await fetch(
        `/api/v1/content/ads/buy?apartment_id=${apartmentId}&seller_id=${sellerId}&sum=${sum}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (res.ok) {
        setInfoModalData({
          title: "Purchase Initiated",
          message:
            "Your purchase has been initiated! Please confirm this transaction within three days.",
        });
        setShowInfoModal(true);
      } else {
        const body = await res.json().catch(() => ({}));
        if (res.status === 400 && body.error === "not enough money") {
          setShowAddFunds(true);
        } else {
          setInfoModalData({
            title: "Purchase Failed",
            message: body.error || "Failed to initiate purchase. Please try again.",
          });
          setShowInfoModal(true);
        }
      }
    } catch (e) {
      console.error(e);
      setInfoModalData({
        title: "Network Error",
        message: "Network error occurred. Please try again later.",
      });
      setShowInfoModal(true);
    }
  };

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container-fluid p-0 bg-white">
          <div className="container py-5 mt-5">
            <div className="row g-5">
              {/* Галерея */}
              <PropertyGallery
                thumbnails={photoUrls}
                initialMain={photoUrls[0] || "/placeholder.png"}
              />

              {/* Детали & Автор */}
              <div className="col-lg-5">
                <h1 className="fw-bold mb-3">{ad.title}</h1>
                <h3 className="text-success mb-4">
                  ₸{Number(ad.price).toLocaleString("ru-RU")}
                </h3>
                <p>
                  <strong>Address:</strong> {ad.address}, <em>{cityName}</em>, <em>{districtName}</em>
                </p>
                <hr />

                {/* Статус «в залоге» */}
                <p>
                  <strong>In pledge:</strong>{" "}
                  {ad.pledge ? (
                    <span className="text-danger">{ad.bank_name || "—"}</span>
                  ) : (
                    <span>No</span>
                  )}
                </p>

                <div className="row">
                  <div className="col-sm-6">
                    <p>
                      <strong>Area:</strong> {ad.square} m²
                    </p>
                    <p>
                      <strong>Rooms:</strong> {ad.num_rooms}
                    </p>
                    <p>
                      <strong>Floor:</strong> {ad.floor}
                    </p>
                    <p>
                      <strong>Ceiling height:</strong> {ad.ceiling_height} m
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p>
                      <strong>Year built:</strong> {ad.year_construction}
                    </p>
                    <p>
                      <strong>Type:</strong> {ad.ads_type === "1" ? "For Sell" : "For Rent"}
                    </p>
                  </div>
                </div>

                {/* Карточка автора (если залогинен) */}
                {user && (
                  <div className="card border-0 shadow-sm p-4 mt-4">
                    <h5 className="mb-3">Author of the ad</h5>
                    <div className="d-flex align-items-center">
                      <i
                        className="fa fa-user-circle fa-2x me-3"
                        style={{ color: "var(--primary)" }}
                      />
                      <div>
                        <p className="mb-1 fw-semibold">{ad.author.name}</p>
                        <p className="text-muted mb-0">{ad.author.login}</p>
                      </div>
                    </div>
                    <div className="d-flex flex-column mt-4">
                      <button
                        className="btn btn-outline-primary mb-2"
                        onClick={startChat}
                      >
                        Send Message
                      </button>
                      <button
                        className="btn w-100 text-primary"
                        style={{ backgroundColor: "#e6f7ff" }}
                        onClick={() => setShowConfirmModal(true)}
                      >
                        Make a purchase
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Описание & Комментарии */}
            <div className="row mt-5">
              <div className="col-12">
                <h4>Description</h4>
                <p style={{ lineHeight: 1.7 }}>{ad.description}</p>

                <h4 className="mt-4">Comments</h4>
                {(!isGuest && !needsSubscription) ? (
                  <div className="comments-normal">
                    <textarea
                      className="form-control mb-3"
                      placeholder="Add comment..."
                      rows={3}
                    />
                    {comments.map((c) => (
                      <div key={c.id} className="mb-3">
                        <strong>{c.author}</strong> <small className="text-muted">{c.time}</small>
                        <p className="mb-1">{c.text}</p>
                        <hr />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="blurred-box">
                    <div className="blurred-text">
                      <textarea
                        className="form-control mb-3"
                        placeholder="Add comment..."
                        rows={3}
                        disabled
                      />
                      {comments.map((c) => (
                        <div key={c.id} className="mb-3">
                          <strong>{c.author}</strong> <small className="text-muted">{c.time}</small>
                          <p className="mb-1">{c.text}</p>
                          <hr />
                        </div>
                      ))}
                    </div>
                    <div className="overlay-message">
                      {isGuest && (
                        <>
                          <p className="mb-3">Please register to view and add comments.</p>
                          <button
                            className="btn btn-success"
                            onClick={() => setShowAuthModal(true)}
                          >
                            Register
                          </button>
                        </>
                      )}
                      {needsSubscription && (
                        <>
                          <p className="mb-3">Purchase a subscription to see comments.</p>
                          <button
                            className="btn btn-success"
                            onClick={() => navigate("/subscribe")}
                          >
                            Buy Premium
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка авторизации (если гость) */}
      {showAuthModal && (
        <SignInModal onClose={() => setShowAuthModal(false)} initialTab="register" />
      )}

      {/* Модалка подтверждения перед fetch("/ads/buy") */}
      {showConfirmModal && (
        <ConfirmModal
          title="Are you sure you want to make this purchase?"
          message="To complete this transaction, you have three days to finalize all required paperwork and register the property ownership. After that, please return to our platform and confirm the purchase so the funds can be released to the seller. If you cancel, the full amount will be refunded to your account. You can confirm or cancel on Account&Payments page."
          confirmLabel="Confirm Purchase"
          cancelLabel="Cancel"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            performPurchase();
          }}
        />
      )}

      {/* Информационная модалка (после performPurchase) */}
      {showInfoModal && (
        <InfoModal
          title={infoModalData.title}
          message={infoModalData.message}
          onClose={() => {
            setShowInfoModal(false);
            if (infoModalData.title === "Purchase Initiated") {
              navigate("/account-payments");
            }
          }}
        />
      )}

      {/* Если недостаточно средств, открываем AddFundsModal */}
      {showAddFunds && (
        <AddFundsModal
          userId={user.id}
          onSuccess={(newBalance, isSubscribed) => {
            // при необходимости можно обновить контекст user
            setShowAddFunds(false);
          }}
          onError={(msg) => {
            console.error(msg);
            setShowAddFunds(false);
          }}
          onClose={() => setShowAddFunds(false)}
        />
      )}
    </Layout>
  );
};

export default PropertyDetails;
