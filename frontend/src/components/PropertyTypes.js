// src/components/PropertyTypes.js

import React from "react";
import apartmentIcon from "../assets/img/icon-apartment.png";
import buildingIcon from "../assets/img/icon-building.png";
import housingIcon from "../assets/img/icon-housing.png";
import condominiumIcon from "../assets/img/icon-condominium.png";

const cities = [
  { name: "Astana", icon: apartmentIcon },
  { name: "Almaty", icon: buildingIcon },
  { name: "Shymkent", icon: housingIcon },
  { name: "Aktobe", icon: condominiumIcon },
  { name: "Karaganda", icon: apartmentIcon },
  { name: "Pavlodar", icon: buildingIcon },
  { name: "Kyzylorda", icon: housingIcon },
  { name: "Stepnogorsk", icon: condominiumIcon },
];

const PropertyTypes = () => (
  <div className="container-xxl py-3">
    <div className="container">
      <div
        className="text-center mx-auto mb-5 wow fadeInUp"
        data-wow-delay="0.1s"
        style={{ maxWidth: "600px" }}
      >
        <h1 className="mb-3">Property in your city</h1>
        <p>
          Browse real estate in Kazakhstan’s major cities — click a city to see
          its listings.
        </p>
      </div>

      <div className="row g-4">
        {cities.map((city, idx) => (
          <div
            key={city.name}
            className="col-lg-3 col-sm-6 wow fadeInUp"
            data-wow-delay={`${0.1 + idx * 0.1}s`}
          >
            <a
              className="cat-item d-block bg-light text-center rounded p-3"
              href={`/#/search?city=${encodeURIComponent(city.name)}`}
            >
              <div className="rounded p-4">
                <div className="icon mb-3">
                  <img className="img-fluid" src={city.icon} alt={city.name} />
                </div>
                <h6>{city.name}</h6>
                <span>View listings</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PropertyTypes;
