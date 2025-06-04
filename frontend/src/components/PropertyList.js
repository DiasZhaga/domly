import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const TABS = ["Featured", "For Sell", "For Rent"];

export default function PropertyList({ filters = {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Featured");

   // Собираем зависимости для мемоизации
  const stableFilters = useMemo(() => filters, [
    filters.ads_type,
    filters.city,
    filters.district,
    filters.complex,
    Array.isArray(filters.rooms) ? filters.rooms.join(",") : "",
    filters.minPrice,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    filters.minYear,
    filters.maxYear,
    filters.minFloor,
    filters.maxFloor,
    filters.minCeil,
    filters.maxCeil,
    filters.pledge,
  ]);

  // Формируем строку запроса
  const getQueryParams = () => {
    const p = new URLSearchParams();

    // табы определяют ads_type
    if (activeTab === "For Sell") p.set("ads_type", "1");
    if (activeTab === "For Rent") p.set("ads_type", "2");

    // базовые фильтры
    if (stableFilters.city)      p.append("city", stableFilters.city);
    if (stableFilters.district)  p.append("district", stableFilters.district);
    if (stableFilters.complex)   p.append("complex", stableFilters.complex);

    // диапазон цены
    if (stableFilters.minPrice)  p.append("minPrice", stableFilters.minPrice);
    if (stableFilters.maxPrice)  p.append("maxPrice", stableFilters.maxPrice);

    // комнаты (массив)
    if (Array.isArray(stableFilters.rooms)) {
      stableFilters.rooms.forEach(r => p.append("rooms", r));
    }

    // расширенные диапазоны
    if (stableFilters.minArea)   p.append("minArea", stableFilters.minArea);
    if (stableFilters.maxArea)   p.append("maxArea", stableFilters.maxArea);
    if (stableFilters.minYear)   p.append("minYear", stableFilters.minYear);
    if (stableFilters.maxYear)   p.append("maxYear", stableFilters.maxYear);
    if (stableFilters.minFloor)  p.append("minFloor", stableFilters.minFloor);
    if (stableFilters.maxFloor)  p.append("maxFloor", stableFilters.maxFloor);
    if (stableFilters.minCeil)   p.append("minCeil", stableFilters.minCeil);
    if (stableFilters.maxCeil)   p.append("maxCeil", stableFilters.maxCeil);

    // залог
    if (stableFilters.pledge)    p.append("pledge", stableFilters.pledge);

    return p.toString();
  };


  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs  = getQueryParams();
        const url = `/api/v1/content/ads${qs ? `?${qs}` : ""}`;
        const res = await fetch(url, {
          credentials: "include",
          headers:     { Accept: "application/json" },
        });
        if (res.status === 401) {
          throw new Error("Please sign in to view properties");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Server error: ${res.status}`);
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [activeTab, stableFilters]);

  return (
    <div className="container-xxl py-4">
      <div className="container">
        {/* Заголовок + табы */}
        <div className="row g-0 gx-5 align-items-end mb-4">
          <div className="col-lg-6">
            <h1 className="mb-3">Property Listing</h1>
          </div>
          <div className="col-lg-6 text-lg-end">
            <ul className="nav nav-pills d-inline-flex mb-3">
              {TABS.map(tab => (
                <li className="nav-item me-2" key={tab}>
                  <button
                    className={`btn btn-outline-primary ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Статусы */}
        {loading && <p>Loading properties...</p>}
        {error   && <p className="text-danger">Error: {error.message}</p>}
        {!loading && !error && items.length === 0 && (
          <p>No properties found.</p>
        )}

        {/* Список объявлений */}
        <div className="row g-4">
          {items.map(d => {
            // главная фотография
            const mainPhotoFile =
              d.url_photos?.find(p => p.main_url)?.url ||
              d.url_photos?.[0]?.url ||
              "";
            const mainPhoto = mainPhotoFile.startsWith("http")
              ? mainPhotoFile
              : `/ads-photos/${mainPhotoFile}`;

            return (
              <div className="col-lg-4 col-md-6" key={d.id}>
                <div className="property-item d-flex flex-column h-100 rounded overflow-hidden">
                  <div className="position-relative overflow-hidden">
                    <Link to={`/property-details/${d.id}`}>
                      <img
                        className="img-fluid"
                        src={mainPhoto}
                        alt={d.title}
                      />
                    </Link>
                    <span className="bg-primary text-white badge position-absolute top-0 start-0 m-3">
                      {Number(d.ads_type) === 1 ? "For Sell" : "For Rent"}
                    </span>
                  </div>

                  <div className="p-4 pb-0">
                    <h5 className="text-primary mb-3">
                      ₸{Number(d.price).toLocaleString("ru-RU")}
                    </h5>
                    <Link
                      to={`/property-details/${d.id}`}
                      className="d-block h5 mb-2"
                    >
                      {d.title}
                    </Link>
                    <p>
                      <i className="fa fa-map-marker-alt text-primary me-2" />
                      {`${d.address}`}
                    </p>
                  </div>

                  <div className="d-flex border-top">
                    <small className="flex-fill text-center border-end py-2">
                      <i className="fa fa-ruler-combined text-primary me-2" />
                      {d.square} m²
                    </small>
                    <small className="flex-fill text-center py-2">
                      <i className="fa fa-bed text-primary me-2" />
                      {d.num_rooms} Bed
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Кнопка "Browse More" */}
        <div className="text-center mt-4">
          <button className="btn btn-primary py-3 px-5">
            Browse More Property
          </button>
        </div>
      </div>
    </div>
  );
}