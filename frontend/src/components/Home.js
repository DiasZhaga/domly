// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Layout from "./Layout"
import Search from "./Search";
import PropertyTypes from "./PropertyTypes";
import PropertyList from "./PropertyList";
import About from "./About";
import SubscriptionPromo from "./SubscriptionPromo";

const Home = () => {
  const navigate = useNavigate();
  // Стейт для всех фильтров
  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    location: "",
    rooms: [],
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    minYear: "",
    maxYear: "",
    minFloor: "",
    maxFloor: "",
    minCeil: "",
    maxCeil: "",
    pledge: "",
  });

  // Коллбэк, который получает новый объект фильтров из <Search />
  const handleSearch = (newFilters) => {
    // 1) Обновляем локальный стейт (если он вам ещё нужен)
    const merged = { ...filters, ...newFilters };
    setFilters(merged);

    // 2) Переходим на страницу buy-property, передаём фильтры в state
    navigate("/buy-property", { state: merged });
  };

  return (
    <Layout>
    <div>
      <Header />

      {/* Панель поиска */}
      <Search
        onSearch={handleSearch}
        initialFilters={filters}
      />

      <PropertyTypes />
      <About />

      {/* Список свойств, который реагирует на filters */}
      <PropertyList filters={filters} />

      <SubscriptionPromo />
    </div>
    </Layout>
  );
};

export default Home;
