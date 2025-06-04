// src/pages/MyAds.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function MyAdsPage() {
  const { user } = useAuth();
  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/content/ads/my", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (res.status === 401) {
          throw new Error("Please sign in first");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Error ${res.status}`);
        }
        setAds(await res.json());
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <Layout>
      <div className="header-section bg-white">
      <div className="container py-5">
        <h1 className="mb-4">My Listings</h1>

        {!user && <p>Please sign in to view your ads.</p>}
        {loading && <p>Loading…</p>}
        {error   && <p className="text-danger">Error: {error.message}</p>}
        {!loading && !error && ads.length === 0 &&
          <p className="text-muted">You have no active ads.</p>
        }

        <div className="row g-4">
          {ads.map(ad => {
            // берём именно имя файла
            const mainPhotoFile =
              ad.url_photos?.find(p => p.main_url)?.url ||
              ad.url_photos?.[0]?.url ||
              "";
            // формируем URL через прокси
            const photoUrl = mainPhotoFile
              ? `/ads-photos/${mainPhotoFile}`
              : "/placeholder.png";

            return (
              <div className="col-md-6 col-lg-4" key={ad.id}>
                <div className="property-item d-flex flex-column h-100 rounded overflow-hidden">
                  {/* картинка с нужным размером и эффектом */}
                  <div className="position-relative overflow-hidden">
                    <Link to={`/property-details/${ad.id}`}>
                      <img
                        className="img-fluid"
                        src={photoUrl}
                        alt={ad.title}
                      />
                    </Link>
                    <span className="bg-primary text-white badge position-absolute top-0 start-0 m-3">
                      {Number(ad.ads_type) === 1 ? "For Sell" : "For Rent"}
                    </span>
                  </div>

                  <div className="p-4 pb-0">
                    <h5 className="text-primary mb-3">₸{Number(ad.price).toLocaleString("ru-RU")}</h5>
                    <Link to={`/property-details/${ad.id}`} className="d-block h5 mb-2">
                      {ad.title}
                    </Link>
                    <p>
                      <i className="fa fa-map-marker-alt text-primary me-2"></i>
                      {`${ad.address}`}
                    </p>
                  </div>

                  <div className="p-4 pt-2">
                    <div className="d-flex">
                      <Link
                        to={`/edit-ad/${ad.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                        style={{ minWidth: "100px" }}
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/edit-photos/${ad.id}`}
                        className="btn btn-sm btn-outline-secondary me-2"
                        style={{ minWidth: "100px" }}
                        >
                        Edit Photos
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ minWidth: "100px" }}
                        onClick={async () => {
                          if (!window.confirm("Delete this ad?")) return;
                          await fetch(`/api/v1/content/ads/my/${ad.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                          setAds(list => list.filter(x => x.id !== ad.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </Layout>
  );
}

export default MyAdsPage;
