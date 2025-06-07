import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Carousel from "react-bootstrap/Carousel";

const PropertyGallery = ({ thumbnails, initialMain }) => {
  // находим из массива индекс initialMain или берём 0
  const initialIndex = thumbnails.findIndex((img) => img === initialMain);
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const [modalOpen, setModalOpen] = useState(false);

  // картинка по текущему индексу
  const mainImage = thumbnails[currentIndex] || initialMain;

  // при переключении в Carousel
  const handleSelect = (selectedIndex) => {
    setCurrentIndex(selectedIndex);
  };

  return (
    <>
      <div className="col-lg-7">
        {/* главное превью */}
        <img
          src={mainImage}
          alt="Main"
          className="img-fluid mb-3 rounded"
          style={{
            width: "750px",
            height: "470px",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setModalOpen(true)}
        />

        {/* ряд миниатюр */}
        <div className="d-flex flex-wrap gap-2">
          {thumbnails.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumbnail ${i + 1}`}
              onMouseEnter={() => setCurrentIndex(i)}
              onClick={() => {
                setCurrentIndex(i);
                setModalOpen(true);
              }}
              style={{
                width: "110px",
                height: "75px",
                objectFit: "cover",
                borderRadius: "6px",
                cursor: "pointer",
                border:
                  currentIndex === i ? "2px solid var(--primary)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* zoom-модалка с Carousel */}
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size="lg"
        centered
        dialogClassName="custom-zoom-modal"
      >
        <Modal.Body className="p-0">
          <Carousel
            activeIndex={currentIndex}
            onSelect={handleSelect}
            indicators={false}
            prevLabel=""
            nextLabel=""
          >
            {thumbnails.map((img, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`Slide ${i + 1}`}
                  style={{ maxHeight: "80vh", objectFit: "contain" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={() => setModalOpen(false)}
            style={{
              backgroundColor: "var(--primary)",
              borderColor: "var(--primary)",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PropertyGallery;
