import React from "react";
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
            <h1 className="mb-4">#1 Place To Find The Perfect Property</h1>
            <p className="mb-4">
            Discover the easiest way to buy and sell real estate directly—without the hassle and extra fees. 
            We simplify property transactions, offering transparency and complete information to help you make confident decisions.
            </p>
            <p><i className="fa fa-check text-primary me-3"></i>Verified insights and honest resident reviews</p>
            <p><i className="fa fa-check text-primary me-3"></i>Digital signing and online notarization</p>
            <p><i className="fa fa-check text-primary me-3"></i>No hidden fees or middleman costs</p>
            <a className="btn btn-primary py-3 px-5 mt-3" href="#">Read More</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;