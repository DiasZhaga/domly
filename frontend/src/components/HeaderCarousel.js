import React from "react";
import { Carousel } from "react-bootstrap";
import carousel1 from "../assets/img/Riviera_RC.jpg";
import carousel2 from "../assets/img/Gulder_RC.jpg";
import "bootstrap/dist/css/bootstrap.min.css";

const HeaderCarousel = () => {
  return (
    <Carousel>
      <Carousel.Item>
        <img className="d-block w-100" src={carousel1} alt="Slide 1" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src={carousel2} alt="Slide 2" />
      </Carousel.Item>
    </Carousel>
  );
};

export default HeaderCarousel;