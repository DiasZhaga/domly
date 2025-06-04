// src/components/Search.js
import React, { useState, useEffect } from "react";

export default function Search({ onSearch, initialFilters = {} }) {
  // — основные фильтры
  const [city,       setCity]       = useState(initialFilters.city      || "");
  const [type,       setType]       = useState(initialFilters.type      || "");
  const [minPrice,   setMinPrice]   = useState(initialFilters.minPrice  || "");
  const [maxPrice,   setMaxPrice]   = useState(initialFilters.maxPrice  || "");
  const [rooms, setRooms] = useState(initialFilters.rooms || []);

  // — справочники
  const [cities,    setCities]    = useState([]);
  const [districts, setDistricts] = useState([]);
  const [complexes, setComplexes] = useState([]);

  // — расширенные
  const [district,  setDistrict]  = useState(initialFilters.district  || "");
  const [complex,   setComplex]   = useState(initialFilters.complex   || "");
  const [minArea,   setMinArea]   = useState(initialFilters.minArea   || "");
  const [maxArea,   setMaxArea]   = useState(initialFilters.maxArea   || "");
  const [minYear,   setMinYear]   = useState(initialFilters.minYear   || "");
  const [maxYear,   setMaxYear]   = useState(initialFilters.maxYear   || "");
  const [minFloor,  setMinFloor]  = useState(initialFilters.minFloor  || "");
  const [maxFloor,  setMaxFloor]  = useState(initialFilters.maxFloor  || "");
  const [minCeil,   setMinCeil]   = useState(initialFilters.minCeil   || "");
  const [maxCeil,   setMaxCeil]   = useState(initialFilters.maxCeil   || "");
  const [pledge,    setPledge]    = useState(initialFilters.pledge    || "");

  // — показать/скрыть advanced
  const [advanced,  setAdvanced]  = useState(false);

  // загрузка справочников
  useEffect(() => {
    fetch("/api/v1/locations/cities", { credentials: "include" })
      .then(r => r.json()).then(setCities).catch(console.error);
  }, []);

  useEffect(() => {
    if (!city) return setDistricts([]), setDistrict(""), void 0;
    fetch(`/api/v1/locations/districts?city_id=${city}`, { credentials: "include" })
      .then(r => r.json()).then(setDistricts).catch(console.error);
  }, [city]);

  useEffect(() => {
    if (!district) return setComplexes([]), setComplex(""), void 0;
     fetch(`/api/v1/content/appartments?district_id=${district}`, { credentials: "include" })
      .then(r => r.json()).then(setComplexes).catch(console.error);
  }, [district]);

  const toggleRoom = opt => {
  setRooms(prev => {
    const s = String(opt);
    if (prev.includes(s)) {
      // убрать
      return prev.filter(x => x !== s);
    } else {
      // добавить
      return [...prev, s];
    }
  });
  };

   const clearRooms = () => setRooms([]);

  const clearAll = () => {
    setCity("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setRooms([]);
    setDistrict("");
    setComplex("");
    setMinArea("");
    setMaxArea("");
    setMinYear("");
    setMaxYear("");
    setMinFloor("");
    setMaxFloor("");
    setMinCeil("");
    setMaxCeil("");
    setPledge("");
    onSearch({}); // notify parent to reset
  }; 
  // собрать и отдать наверх
  const handleSearch = () => {
    onSearch({
      city, type, minPrice, maxPrice, rooms,
      district, complex,
      minArea, maxArea,
      minYear, maxYear,
      minFloor, maxFloor,
      minCeil, maxCeil,
      pledge,
    });
  };

  const formatDisplay = (v) =>
  v === "" ? "" : Number(v).toLocaleString("ru-RU");

  return (
    <div className="container-fluid bg-primary mb-5 py-4">
      <div className="container">
        {/* ========== первый ряд ========== */}
        <div className="row g-2 align-items-end">
          {/* City */}
          <div className="col-md-3">
            <label className="form-label text-white">City</label>
            <select
              className="form-select"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="col-md-3">
            <label className="form-label text-white">Type</label>
            <select
              className="form-select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">All</option>
              <option value="1">For Sale</option>
              <option value="2">For Rent</option>
            </select>
          </div>

          {/* Price with separators + Clear */}
          <div className="col-md-3">
            <label className="form-label text-white">Price (₸)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Min"
                value={formatDisplay(minPrice)}
                onFocus={() => setMinPrice(minPrice)}
                onChange={e => setMinPrice(e.target.value.replace(/\D/g, ""))}
              />
              <span className="input-group-text">—</span>
              <input
                type="text"
                className="form-control"
                placeholder="Max"
                value={formatDisplay(maxPrice)}
                onFocus={() => setMaxPrice(maxPrice)}
                onChange={e => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="col-md-auto ms-md-3">
            <label className="form-label text-white">Rooms</label>
            <div className="d-flex flex-wrap">
              {[1,2,3,4,"5+"].map(opt => {
                const s = String(opt);
                const isActive = rooms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`btn btn-sm me-2 mb-2 ${
                      isActive ? "btn-room-active" : "btn-light"
                    }`}
                    onClick={() => toggleRoom(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
              <button
                type="button"
                className="btn btn-sm btn-light mb-2"
                onClick={clearRooms}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* ========== управление: Clear / More / Search ========== */}
        <div className="row mt-3 align-items-center">
          <div className="col">
            <button
              type="button"
              className="more-settings text-white me-4"
              onClick={() => setAdvanced(a => !a)}
            >
              <i className="fa fa-sliders-h me-1"></i>
              {advanced ? "Hide settings" : "More settings"}
            </button>
            <button
              type="button"
              className="btn btn-link text-white p-0 me-3"
              onClick={clearAll}
            >
              <i className="fa fa-times me-1"></i>
              Clear All
            </button>
          </div>
          <div className="col text-end">
            <button className="btn btn-dark" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* ========== advanced блок ========== */}
        {advanced && (
          <div className="row g-3 mt-3 bg-light p-4 rounded">
            {/* District */}
            <div className="col-md-6">
              <label className="form-label">District</label>
              <select
                className="form-select"
                value={district}
                onChange={e => setDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Complex */}
            <div className="col-md-6">
              <label className="form-label">Complex</label>
              <select
                className="form-select"
                value={complex}
                onChange={e => setComplex(e.target.value)}
              >
                <option value="">All Complexes</option>
                {complexes.map(x => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div className="col-md-6">
              <label className="form-label">Area (m²)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minArea}
                  onChange={e => setMinArea(e.target.value)}
                />
                <span className="input-group-text">—</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxArea}
                  onChange={e => setMaxArea(e.target.value)}
                />
              </div>
            </div>

            {/* Year built */}
            <div className="col-md-6">
              <label className="form-label">Year built</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minYear}
                  onChange={e => setMinYear(e.target.value)}
                />
                <span className="input-group-text">—</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxYear}
                  onChange={e => setMaxYear(e.target.value)}
                />
              </div>
            </div>

            {/* Floor */}
            <div className="col-md-6">
              <label className="form-label">Floor</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minFloor}
                  onChange={e => setMinFloor(e.target.value)}
                />
                <span className="input-group-text">—</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxFloor}
                  onChange={e => setMaxFloor(e.target.value)}
                />
              </div>
            </div>

            {/* Ceiling */}
            <div className="col-md-6">
              <label className="form-label">Ceiling height (m)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minCeil}
                  onChange={e => setMinCeil(e.target.value)}
                />
                <span className="input-group-text">—</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxCeil}
                  onChange={e => setMaxCeil(e.target.value)}
                />
              </div>
            </div>

            {/* In pledge */}
            <div className="col-md-3">
              <label className="form-label">In pledge</label>
              <select
                className="form-select form-select-sm"
                value={pledge}
                onChange={e => setPledge(e.target.value)}
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}