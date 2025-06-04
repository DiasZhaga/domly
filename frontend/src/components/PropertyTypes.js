import React from "react";
import apartmentIcon from "../assets/img/icon-apartment.png";
import villaIcon from "../assets/img/icon-villa.png";
import houseIcon from "../assets/img/icon-house.png";
import housingIcon from "../assets/img/icon-housing.png";
import buildingIcon from "../assets/img/icon-building.png";
import neighborhoodIcon from "../assets/img/icon-neighborhood.png";
import condominiumIcon from "../assets/img/icon-condominium.png";
import luxuryIcon from "../assets/img/icon-luxury.png";

const properties = [
  { name: "Apartment", icon: apartmentIcon },
  { name: "Villa", icon: villaIcon },
  { name: "Home", icon: houseIcon },
  { name: "Office", icon: housingIcon },
  { name: "Building", icon: buildingIcon },
  { name: "Townhouse", icon: neighborhoodIcon },
  { name: "Shop", icon: condominiumIcon },
  { name: "Garage", icon: luxuryIcon },
];

const PropertyTypes = () => {
  return (
    <div className="container-xxl py-3">
      <div className="container">
        <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
          <h1 className="mb-3">Property Types</h1>
          <p>
            Browse all types of real estate across Kazakhstan — from city apartments to countryside villas.
          </p>
        </div>
        <div className="row g-4">
          {properties.map((property, index) => (
            <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`} key={index}>
              <a className="cat-item d-block bg-light text-center rounded p-3" href="#">
                <div className="rounded p-4">
                  <div className="icon mb-3">
                    <img className="img-fluid" src={property.icon} alt={property.name} />
                  </div>
                  <h6>{property.name}</h6>
                  <span>123 Properties</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyTypes;
