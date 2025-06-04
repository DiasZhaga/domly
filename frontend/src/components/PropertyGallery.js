import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const PropertyGallery = ({ thumbnails, initialMain }) => {
  const [mainImage, setMainImage] = useState(initialMain);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="col-lg-7">
        <img
          src={mainImage}
          alt="Main"
          className="img-fluid mb-3 rounded"
          style={{ width: "750px", height: "470px", objectFit: "cover", cursor: "pointer" }}
          onClick={() => setModalOpen(true)}
        />
        <div className="d-flex flex-wrap gap-2">
          {thumbnails.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumbnail ${i + 1}`}
              onMouseEnter={() => setMainImage(img)}
              onClick={() => {
                setMainImage(img);
                setModalOpen(true);
              }}
              style={{
                width: "110px",
                height: "75px",
                objectFit: "cover",
                borderRadius: "6px",
                cursor: "pointer",
                border: mainImage === img ? "2px solid #0dcaf0" : "none"
              }}
            />
          ))}
        </div>
      </div>

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} size="lg" centered>
        <Modal.Body className="text-center">
          <img src={mainImage} alt="Zoomed" style={{ width: "100%", borderRadius: "10px" }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PropertyGallery;