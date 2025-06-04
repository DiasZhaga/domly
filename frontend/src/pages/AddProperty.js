// src/components/AddProperty.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ApartmentForm from "../components/ApartmentForm";
import "../assets/css/style.css";

const AddProperty = () => {
  const navigate = useNavigate();
  const [actionType, setActionType] = useState("sell"); 
  const [category, setCategory]     = useState(null);

  const categories = [
    { label: "Apartment",      value: "apartment" },
    { label: "House / Cottage",value: "house"     },
    { label: "Garage / Parking",value: "garage"    },
    { label: "Land Plot",       value: "plot"      },
    { label: "Commercial",      value: "commercial"},
    { label: "Business",        value: "business"  },
    { label: "Industrial / Factory", value: "industrial" },
  ];

  const filteredCategories = categories.filter(
    c => !(actionType === "rent" && c.value === "business")
  );

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container-fluid p-0 bg-white">
      <div className="container pt-5 mt-5">
        <h2 className="mb-4">Create an Listing</h2>

        <div className="row g-4">
          {/* Выбор Sell / Rent */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">What would you like to do?</div>
              <ul className="list-group list-group-flush">
                {[
                  { label: "Sell",     value: "sell" },
                  { label: "Rent Out", value: "rent" }
                ].map(opt => (
                  <li
                    key={opt.value}
                    className={`list-group-item d-flex justify-content-between align-items-center ${actionType === opt.value ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setActionType(opt.value);
                      setCategory(null);
                    }}
                  >
                    {opt.label}
                    {actionType === opt.value && <span>✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Выбор категории */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">Choose a category</div>
              <ul className="list-group list-group-flush">
                {filteredCategories.map(cat => (
                  <li
                    key={cat.value}
                    className={`list-group-item ${category === cat.value ? "bg-light" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setCategory(cat.value)}
                  >
                    {cat.label}
                    {category === cat.value && <span className="float-end">✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Рендер формы, когда выбрали категорию */}
        {category === "apartment" && (
          <ApartmentForm
            actionType={actionType}
            category={category}
            onSuccess={() => navigate("/my-ads")}
          />
        )}
      </div>

    </div>
    </div>
    </Layout>
  );
};

export default AddProperty;
