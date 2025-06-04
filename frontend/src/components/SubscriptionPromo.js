import React from "react";
import { Link } from 'react-router-dom';
import agentImg from "../assets/img/Simphonia_RC.jpg"; 
import { FaComments, FaEye, FaShieldAlt } from "react-icons/fa";

const SubscriptionPromo = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-lg-6">
          <img
            src={agentImg}
            alt="Agent"
            className="img-fluid rounded"
            style={{ borderRadius: "12px" }}
          />
        </div>
        <div className="col-lg-6">
          <h2 className="fw-bold mb-4">Unlock Hidden Insights Before You Buy</h2>
          <p className="mb-4 text-muted">
            Not everything is visible in a listing. Wondering why the price is low? Or why that amazing apartment is still available? With <strong>Potolok Premium</strong>, you’ll know <u>what others won’t tell you</u>.
          </p>

          <ul className="list-unstyled mb-4">
            <li className="mb-3">
              <FaComments className="text-primary me-2" />
              Real user feedback about noise levels, neighborhood safety, and hidden issues (via 2GIS and more)
            </li>
            <li className="mb-3">
              <FaEye className="text-primary me-2" />
              Verified comments about property condition, like <em>“roof leaks,”</em> <em>“noisy nightclubs nearby,”</em> or <em>“non-functioning elevator”</em>
            </li>
            <li className="mb-3">
              <FaShieldAlt className="text-primary me-2" />
              Protect your investment — no more surprises after signing the contract
            </li>
          </ul>

          <div className="d-flex flex-wrap gap-3">
        <Link to="/subscribe" className="btn btn-primary">
          <span className="me-2">🔒</span> Get Full Access Now
        </Link>
        <Link to="/subscribe" className="btn btn-primary">
          Learn More
        </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPromo;
