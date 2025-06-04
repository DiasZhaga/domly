// src/pages/BuyProperty.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Search from "../components/Search";
import PropertyList from "../components/PropertyList";
import HeaderCarousel from "../components/HeaderCarousel";

const BuyProperty = () => {
  const location = useLocation();

  const initial = location.state || {
    ads_type: 1,      // всегда sale
    city:      "",
    type:      "",
    complex:   "",
    rooms:     [],
    minPrice:  "",
    maxPrice:  "",
    minArea:   "",
    maxArea:   "",
    minYear:   "",
    maxYear:   "",
    minFloor:  "",
    maxFloor:  "",
    minCeil:   "",
    maxCeil:   "",
    pledge:    "",
  };
 
  const [filters, setFilters] = useState(initial);

  // Вот правильный вариант handleSearch — он принимает **весь** newFilters
  // и сливает их в наш локальный стейт
  const handleSearch = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <Layout>
    <div className="container-fluid p-0">

      {/* Header */}
      <div className="header bg-white header-section p-0">
        <div className="row g-0 align-items-center flex-column-reverse flex-md-row">
          <div className="col-md-6 p-5 mt-lg-5">
            <h1 className="display-5 animated fadeIn mb-4">Buy Property</h1>
            <nav aria-label="breadcrumb" className="animated fadeIn">
              <ol className="breadcrumb text-uppercase mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/buy-property">Property</Link>
                </li>
                <li
                  className="breadcrumb-item text-body active"
                  aria-current="page"
                >
                  Buy Property
                </li>
              </ol>
            </nav>
          </div>
          <div className="col-md-6 animated fadeIn">
            <HeaderCarousel />
          </div>
        </div>
      </div>
      {/* Header End */}

      {/* Search with callback */}
      <Search onSearch={handleSearch} initialFilters={filters} />

      {/* PropertyList, принимает объект фильтров */}
      <PropertyList filters={filters} />

    </div>
    </Layout>
  );
};

export default BuyProperty;
