// src/pages/EditAdPage.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ApartmentForm from "../components/ApartmentForm";

const EditAdPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // сюда положим все данные формы
  const [initialForm, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // список превью уже загруженных фото + новых
  const [photoList, setPhotoList] = useState([]);
  const photosInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/content/ads/${id}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // записываем форму (без фото)
        setInitial({
          title:             data.title,
          name_appartment:   data.name_appartment,
          square:            data.square,
          num_rooms:         data.num_rooms,
          floor:             data.floor,
          year_construction: data.year_construction,
          address:           data.address,
          price:             data.price,
          ceiling_height:    data.ceiling_height,
          city:              data.city,
          district:          data.district,
          description:       data.description || "",
          bank:              Boolean(data.bank),
          pledge:            Boolean(data.pledge),
        });

        // инициализируем превью для уже существующих фото
        setPhotoList(
          data.photos.map((ph) => ({
            id: ph.id,
            url: ph.url,
            existing: true,    // маркер, чтобы не повторно отправлять на бек
          }))
        );
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // пользователь добавил новые файлы
  const handleNewFiles = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      file,              // file пойдёт в ApartmentForm
      existing: false,
    }));
    setPhotoList((prev) => [...prev, ...newItems]);
  };

  const handleSuccess = () => {
    navigate("/my-ads");
  };

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container py-5">
          <h1 className="mb-4">Edit Listing</h1>
          {loading && <p>Loading…</p>}
          {error && <p className="text-danger">{error.message}</p>}

          {initialForm && (
            <>
              {/* ====== PREVIEW PHOTOS BLOCK ====== */}
              <div className="d-flex flex-wrap align-items-center mb-4">
                {photoList.map((ph) => (
                  <div
                    key={ph.id}
                    className="position-relative me-2 mb-2"
                    style={{ width: 100, height: 100 }}
                  >
                    <img
                      src={ph.url}
                      alt=""
                      className="img-fluid rounded"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        border: ph.existing ? "1px solid #ccc" : "2px dashed #0d6efd",
                      }}
                    />
                    {/* можно добавить крестик для удаления превью */}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => photosInputRef.current.click()}
                >
                  <i className="fa fa-plus me-1" />
                  Add Photo
                </button>
                <input
                  type="file"
                  multiple
                  className="d-none"
                  ref={photosInputRef}
                  onChange={handleNewFiles}
                />
              </div>

              {/* ====== APARTMENT FORM ====== */}
              <ApartmentForm
                actionType="sell"       // или "rent" в зависимости от data.ads_type
                initialForm={initialForm}
                editMode={true}
                adId={id}
                onSuccess={handleSuccess}
                // передаём списком все новые файлы
                extraFiles={photoList.filter((p) => !p.existing).map((p) => p.file)}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditAdPage;
