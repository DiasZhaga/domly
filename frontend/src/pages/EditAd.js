// src/pages/EditAdPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ApartmentForm from "../components/ApartmentForm";

const EditAdPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialForm, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/content/ads/${id}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // Заполняем initialForm (полная структура аналогична тому, что принимает ApartmentForm)
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
          pledge:            Boolean(data.pledge),
          bank_id:           data.bank_id ? String(data.bank_id) : "",
          // Для редактирования передавать ссылку на существующие фото НЕ НУЖНО,
          // потому что мы убрали блок «Add Photo» и «preview» из этой страницы.
        });

      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
            <ApartmentForm
              actionType="sell"       // или "rent", если data.ads_type = 2
              initialForm={initialForm}
              editMode={true}
              adId={id}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditAdPage;
