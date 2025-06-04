import React from "react";
import { Link } from "react-router-dom";
import HeaderCarousel from "./HeaderCarousel";

const Header = () => {
  return (
    <div className="container-fluid header bg-white p-0 header-section">
      <div className="row g-0 align-items-center flex-column-reverse flex-md-row">
        <div className="col-md-6 p-5 mt-lg-5">
          <h1 className="display-5 animated fadeIn mb-4">
          Your <span className="text-primary">home</span> is your castle
          </h1>
          <p className="animated fadeIn mb-4 pb-2">
          We provide everyone with an excellent chance to purchase, sell, rent, or swap real estate without the need of intermediaries.
          </p>
          <Link to="/buy-property" className="btn btn-primary py-3 px-5 me-3 animated fadeIn">Get Started</Link>
        </div>
        <div className="col-md-6 animated fadeIn">
          <HeaderCarousel />
        </div>
      </div>
    </div>
  );
};

export default Header;