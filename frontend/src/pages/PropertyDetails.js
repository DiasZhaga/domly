import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Layout from "../components/Layout";
import PropertyGallery from "../components/PropertyGallery";
import SignInModal from "../components/SignInModal";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Массив комментариев (пока «моковый»)
  const comments = [
    {
      id: 1,
      author: "Erzhan Zhumagaliev",
      text: "Very friendly community, everything is near by, supermarket, laundry mats. Pharmacy and playground. Buss to the subway",
      time: "just now",
    },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/content/ads/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        setAd(await res.json());
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="text-center py-5">Loading…</p>;
  if (error) return <p className="text-danger text-center py-5">{error.message}</p>;
  if (!ad) return <p className="text-center py-5">No data</p>;

  const photoUrls = (ad.url_photos || []).map((p) =>
    p.url.startsWith("http") ? p.url : `/ads-photos/${p.url}`
  );

  const startChat = () => {
    if (ad.author?.id) {
      navigate(`/messages?user2=${ad.author.id}`);
    }
  };

  const isGuest = !user;
  const needsSubscription = user && !user.isSubscribed;

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container-fluid p-0 bg-white">
          <div className="container py-5 mt-5">
            <div className="row g-5">
              {/* === Галерея === */}
              <PropertyGallery
                thumbnails={photoUrls}
                initialMain={photoUrls[0] || "/placeholder.png"}
              />

              {/* === Детали & Автор === */}
              <div className="col-lg-5">
                <h1 className="fw-bold mb-3">{ad.title}</h1>
                <h3 className="text-success mb-4">
                  ₸{Number(ad.price).toLocaleString("ru-RU")}
                </h3>
                <p>
                  <strong>Address:</strong> {ad.address}, {ad.city}, {ad.district}
                </p>
                <hr />
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

                {/* Карточка автора (если пользователь залогинен) */}
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
                        onClick={() => {
                          /* TODO: purchase */
                        }}
                      >
                        Make a purchase
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === Описание & Комментарии === */}
            <div className="row mt-5">
              <div className="col-12">
                <h4>Description</h4>
                <p style={{ lineHeight: 1.7 }}>{ad.description}</p>

                <h4 className="mt-4">Comments</h4>

{(!isGuest && !needsSubscription) ? (
  /* Пользователь залогинен и подписан → показываем «чистый» список комментариев без размытия */
  <div className="comments-normal">
    <textarea
      className="form-control mb-3"
      placeholder="Add comment..."
      rows={3}
    />
    {comments.map((c) => (
      <div key={c.id} className="mb-3">
        <strong>{c.author}</strong>{" "}
        <small className="text-muted">{c.time}</small>
        <p className="mb-1">{c.text}</p>
        <hr />
      </div>
    ))}
  </div>
) : (
  /* Пользователь гость или неподписан → показываем «размытый» блок с оверлеем */
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
          <strong>{c.author}</strong>{" "}
          <small className="text-muted">{c.time}</small>
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

      {showAuthModal && (
        <SignInModal onClose={() => setShowAuthModal(false)} initialTab="register" />
      )}
    </Layout>
  );
};

export default PropertyDetails;
