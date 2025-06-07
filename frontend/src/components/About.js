// src/components/About.js

import React from "react";
import { Link } from "react-router-dom";
import aboutImage from "../assets/img/about.jpg";

const About = () => {
  return (
    <div className="container-xxl py-3">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
            <div className="about-img position-relative overflow-hidden p-5 pe-0">
              <img className="img-fluid w-100" src={aboutImage} alt="About Us" />
            </div>
          </div>
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
            <h1 className="mb-4">Consult Directly with Developers</h1>
            <p className="mb-4">
              We’ve partnered with BI Group, BAZIS, Ulytau Group, Jetisu Group, and many more leading developers. 
              As a subscriber, you gain exclusive access to chat directly with developers—ask about upcoming projects, pricing, neighborhood insights, construction timelines, and secure the best terms on your new home.
            </p>

            <p><i className="fa fa-check text-primary me-3"></i><strong>Official channels:</strong> Communicate directly with BI Group, BAZIS, Ulytau Group, Jetisu and others.</p>
            <p><i className="fa fa-check text-primary me-3"></i><strong>Details:</strong> Find out everything you need to know about the details of the construction project.</p>
            <p><i className="fa fa-check text-primary me-3"></i><strong>Financial question:</strong> All information about the cost of the apartment with all additional expenses and payment methods.</p>

            <Link to="/subscribe" className="btn btn-primary py-3 px-5 mt-3">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
