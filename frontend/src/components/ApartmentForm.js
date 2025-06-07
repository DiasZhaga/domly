// src/components/ApartmentForm.js
import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { InfoModal } from "./CustomModal";  // <-- импортируем наш InfoModal

const ApartmentForm = ({
  actionType = "sell",    // "sell" или "rent"
  initialForm = null,     // данные объявления, если editMode=true
  editMode = false,       // true → PUT, false → POST
  adId,                   // id объявления для PUT
  onSuccess,              // callback после успешного закрытия InfoModal
  extraFiles = []         // при редактировании массив новых файлов (если передали)
}) => {
  // -------------------------------
  // 1. Состояние формы
  // -------------------------------
  const defaultForm = {
    title:             "",
    name_appartment:   "",
    square:            "",
    num_rooms:         "",
    floor:             "",
    year_construction: "",
    address:           "",
    price:             "",
    ceiling_height:    "",
    city:              "",
    district:          "",
    description:       "",
    pledge:            false,
    bank_id:           ""  // id банка (строка, напр. "3")
  };

  const [form, setForm]             = useState(initialForm || defaultForm);
  const [cities, setCities]         = useState([]);
  const [districts, setDistricts]   = useState([]);
  const [complexes, setComplexes]   = useState([]);
  const [banks, setBanks]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // photoList хранит уже загруженные фото ({ id, url }) и новые файлы ({ file, previewUrl })
  const [photoList, setPhotoList] = useState([]);
  const photosRef = useRef(null);

  // Состояния для документов (используются только в режиме создания)
  const [identityFile, setIdentityFile] = useState(null);
  const [ownershipFile, setOwnershipFile] = useState(null);

  // Состояние для показа InfoModal после успешной публикации
  const [showValidationModal, setShowValidationModal] = useState(false);

  // -------------------------------
  // 2. Загрузка справочных данных
  // -------------------------------
  useEffect(() => {
    fetch("/api/v1/locations/cities", { credentials: "include" })
      .then(res => res.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/v1/content/banks", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.banks)) {
          setBanks(data.banks);
          return;
        }
        if (Array.isArray(data)) {
          setBanks(data);
          return;
        }
        setBanks([]);
      })
      .catch(err => {
        console.error("Error fetching /content/banks:", err);
        setBanks([]);
      });
  }, []);

  useEffect(() => {
    if (!initialForm) return;

    setForm({
      ...initialForm,
      bank_id: initialForm.bank_id ? String(initialForm.bank_id) : ""
    });

    // Предзагрузка фото из initialForm.url_photos (если вдруг понадобится)
    if (initialForm.url_photos?.length) {
      setPhotoList(
        initialForm.url_photos.map(ph => ({
          id: ph.id,
          url: ph.url,
          existing: true
        }))
      );
    }

    // Сброс полей документов (не редактируем)
    setIdentityFile(null);
    setOwnershipFile(null);

    if (initialForm.city) {
      fetch(`/api/v1/locations/districts?city_id=${initialForm.city}`, { credentials: "include" })
        .then(res => res.json())
        .then(setDistricts)
        .catch(console.error);
    }
    if (initialForm.district) {
      fetch(`/api/v1/content/appartments?district_id=${initialForm.district}`, { credentials: "include" })
        .then(res => res.json())
        .then(setComplexes)
        .catch(console.error);
    }
  }, [initialForm]);

  // -------------------------------
  // 3. Обработчики изменений
  // -------------------------------
  const onCityChange = e => {
    const cityId = e.target.value;
    setForm(f => ({ ...f, city: cityId, district: "", name_appartment: "" }));
    setDistricts([]);
    setComplexes([]);
    if (cityId) {
      fetch(`/api/v1/locations/districts?city_id=${cityId}`, { credentials: "include" })
        .then(res => res.json())
        .then(setDistricts)
        .catch(console.error);
    }
  };

  const onDistrictChange = e => {
    const districtId = e.target.value;
    setForm(f => ({ ...f, district: districtId, name_appartment: "" }));
    setComplexes([]);
    if (districtId) {
      fetch(`/api/v1/content/appartments?district_id=${districtId}`, { credentials: "include" })
        .then(res => res.json())
        .then(setComplexes)
        .catch(console.error);
    }
  };

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const onFilesChange = e => {
    const files = Array.from(e.target.files);
    const newItems = files.map((f, i) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      existing: false,
      id: `new-${Date.now()}-${i}`
    }));
    setPhotoList(pl => [...pl, ...newItems]);
    e.target.value = null;
  };

  const removePhoto = idx => {
    setPhotoList(pl => {
      const copy = [...pl];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const { source, destination } = result;
    setPhotoList(pl => {
      const copy = Array.from(pl);
      const [moved] = copy.splice(source.index, 1);
      copy.splice(destination.index, 0, moved);
      return copy;
    });
  };

  const handleIdentityChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      setIdentityFile(e.target.files[0]);
    }
  };
  const handleOwnershipChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      setOwnershipFile(e.target.files[0]);
    }
  };

  // -------------------------------
  // 4. Отправка формы (POST или PUT)
  // -------------------------------
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (form.pledge && !form.bank_id) {
        throw new Error("Please select a bank when 'In pledge' is checked");
      }

      // Если мы в режиме создания, проверяем документы
      if (!editMode && (!identityFile || !ownershipFile)) {
        throw new Error("Please upload both identity and ownership documents.");
      }

      const data = new FormData();
      data.append("title", form.title);
      data.append("name_appartment", form.name_appartment);
      data.append("square", form.square);
      data.append("num_rooms", form.num_rooms);
      data.append("floor", form.floor);
      data.append("year_construction", form.year_construction);
      data.append("address", form.address);
      data.append("price", form.price);
      data.append("ceiling_height", form.ceiling_height);
      data.append("description", form.description);
      data.append("city", form.city);
      data.append("district", form.district);
      data.set("ads_type", actionType === "sell" ? "1" : "2");

      data.append("pledge", form.pledge ? "true" : "false");
      if (form.pledge) {
        data.append("bank_id", form.bank_id);
      }

      // 4.1) Фотографии
      photoList.forEach(item => {
        if (item.file) {
          data.append("photos", item.file);
        } else if (item.id && item.existing) {
          data.append("existing_photos[]", item.id);
        }
      });

      // 4.2) Документы — только в режиме создания
      if (!editMode) {
        data.append("identity", identityFile);
        data.append("ownership", ownershipFile);
      }

      const url = editMode
        ? `/api/v1/content/ads/my/${adId}`
        : `/api/v1/content/ads`;
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: data
      });

      if (res.status === 401) {
        throw new Error("Please sign in");
      }
      if (!res.ok) {
        let parsed;
        try {
          parsed = await res.json();
        } catch {
          throw new Error(`Server error: ${res.status}`);
        }
        throw new Error(parsed.error || JSON.stringify(parsed));
      }

      // Если всё успешно, запускаем таймер на 3 секунды, после которого покажем InfoModal
      setTimeout(() => {
        setShowValidationModal(true);
      }, 3000);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Когда пользователь закрыл InfoModal, вызываем onSuccess (например, редирект на /my-ads)
  const handleCloseModal = () => {
    setShowValidationModal(false);
    onSuccess?.();
  };

  // -------------------------------
  // 5. JSX-разметка
  // -------------------------------
  return (
    <>
      <form className="mt-5" onSubmit={handleSubmit} encType="multipart/form-data">
        {error && <div className="alert alert-danger">{error.message}</div>}

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Listing Title *</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* City → District → Complex */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">City *</label>
            <select
              name="city"
              className="form-select"
              value={form.city}
              onChange={onCityChange}
              required
            >
              <option value="">— select city —</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">District *</label>
            <select
              name="district"
              className="form-select"
              value={form.district}
              onChange={onDistrictChange}
              required
              disabled={!districts.length}
            >
              <option value="">— select district —</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Complex *</label>
            <select
              name="name_appartment"
              className="form-select"
              value={form.name_appartment}
              onChange={handleChange}
              required
              disabled={!complexes.length}
            >
              <option value="">— select complex —</option>
              {complexes.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Area, Rooms, Floor */}
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Area (m²) *</label>
            <input
              type="text"
              name="square"
              className="form-control"
              value={form.square}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Number of Rooms *</label>
            <input
              type="number"
              name="num_rooms"
              className="form-control"
              value={form.num_rooms}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Floor *</label>
            <input
              type="text"
              name="floor"
              className="form-control"
              value={form.floor}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Year Built, Address */}
        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <label className="form-label">Year Built *</label>
            <input
              type="number"
              name="year_construction"
              className="form-control"
              value={form.year_construction}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">Address *</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Price, Ceiling Height */}
        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <label className="form-label">Price *</label>
            <input
              type="text"
              name="price"
              className="form-control"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Ceiling Height *</label>
            <input
              type="text"
              name="ceiling_height"
              className="form-control"
              value={form.ceiling_height}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-3 mt-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* In pledge */}
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="pledge"
            id="pledge"
            checked={form.pledge}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="pledge">
            In pledge
          </label>
        </div>

        {/* Если pledge=true, показываем <select> банков */}
        {form.pledge && (
          <div className="mb-3">
            <label className="form-label">Select Bank *</label>
            <select
              name="bank_id"
              className="form-select"
              value={form.bank_id}
              onChange={handleChange}
              required
            >
              <option value="">— select bank —</option>
              {banks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Photos (Drag&Drop + preview) */}
        <div className="mt-4 mb-4">
          <label className="form-label">Photos</label>
          <input
            type="file"
            multiple
            ref={photosRef}
            className="d-none"
            onChange={onFilesChange}
          />
          <div
            className={`upload-box border border-2 rounded p-4 text-center ${
              dragActive ? "border-primary bg-light" : "border-secondary"
            }`}
            style={{ cursor: "pointer", borderStyle: "dashed" }}
            onClick={() => photosRef.current.click()}
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              onFilesChange({ target: { files: e.dataTransfer.files } });
            }}
          >
            <p>Drag & drop photos here, or click to select</p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={e => { e.stopPropagation(); photosRef.current.click(); }}
            >
              Choose Photos
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="photos-droppable"
              direction="horizontal"
              renderClone={(provided, snapshot, rubric) => {
                const item = photoList[rubric.source.index];
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      width: 100,
                      height: 100,
                      border: rubric.source.index === 0 ? "2px solid green" : "1px solid #ccc",
                      borderRadius: 4,
                      overflow: "hidden",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <img
                      src={item.url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                );
              }}
            >
              {(provided) => (
                <div
                  className="d-flex flex-wrap mt-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {photoList.map((item, idx) => (
                    <Draggable
                      key={item.id}
                      draggableId={String(item.id)}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="position-relative me-2 mb-2"
                          style={{
                            width: 100,
                            height: 100,
                            border: item.existing ? "1px solid #ccc" : "2px dashed #0d6efd",
                            borderRadius: 4,
                            overflow: "hidden",
                            opacity: snapshot.isDragging ? 0.6 : 1,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <img
                            src={item.url}
                            alt=""
                            className="img-fluid"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            className="btn-close btn-sm position-absolute top-0 end-0"
                            onClick={() => removePhoto(idx)}
                          />
                          {idx === 0 && (
                            <span className="badge bg-success position-absolute bottom-0 start-0">
                              Main photo
                            </span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ======================= */}
        {/* ПОЛЯ ДЛЯ ДОКУМЕНТОВ — ТОЛЬКО ПРИ СОЗДАНИИ */}
        {/* ======================= */}
        {!editMode && (
          <>
            <div className="mb-3">
              <label className="form-label">Identity Document (ID) *</label>
              <input
                type="file"
                name="identity"
                accept=".jpg,.jpeg,.png,.pdf"
                className="form-control"
                onChange={handleIdentityChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ownership Document *</label>
              <input
                type="file"
                name="ownership"
                accept=".jpg,.jpeg,.png,.pdf"
                className="form-control"
                onChange={handleOwnershipChange}
                required
              />
            </div>
          </>
        )}

        {/* Submit button */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? editMode
              ? "Updating…"
              : "Publishing…"
            : editMode
            ? "Update Listing"
            : "Publish"}
        </button>
      </form>

      {/* ======================= */}
      {/* InfoModal, который появится через 3 секунды после успешной публикации */}
      {/* ======================= */}
      {showValidationModal && (
        <InfoModal
          title="Your documents have been successfully verified"
          message="We have completed the review of your identification and ownership documents. Your listing has now been published and is live on the site."
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ApartmentForm;
