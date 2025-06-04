// src/components/ApartmentForm.js
import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ApartmentForm = ({
  actionType = "sell",    // "sell" or "rent"
  initialForm = null,     // existing ad data in edit mode (если editMode=true)
  editMode = false,       // true → PUT, false → POST
  adId,                   // id объявления для PUT
  onSuccess               // callback после успеха
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
    city:              "",     // id города
    district:          "",     // id района
    name_appartment:   "",     // комплекс
    description:       "",
    pledge:            false,  // checked/unchecked
    bank_id:           ""      // строка, будет содержать id банка (например, "3")
  };

  const [form, setForm]             = useState(initialForm || defaultForm);
  const [cities, setCities]         = useState([]);
  const [districts, setDistricts]   = useState([]);
  const [complexes, setComplexes]   = useState([]);
  const [banks, setBanks]           = useState([]);   // список банков
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // photoList хранит уже загруженные фото ({ id, url }) и новые файлы ({ file, previewUrl })
  const [photoList, setPhotoList]   = useState([]);

  const photosRef = useRef(null);

  // -------------------------------
  // 2. Загрузка справочных данных
  // -------------------------------

  // 2.1. Загрузка списка городов
  useEffect(() => {
    fetch("/api/v1/locations/cities", { credentials: "include" })
      .then(res => res.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  // 2.2. Загрузка списка банков (один раз)
  useEffect(() => {
    fetch("/api/v1/banks", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        // Ожидаем data = [{ id: 1, name: "Kaspi" }, { id: 2, name: "Halyk" }, …]
        setBanks(data);
      })
      .catch(console.error);
  }, []);

  // 2.3. Если editMode=true, заполняем form и photoList из initialForm
  useEffect(() => {
    if (!initialForm) return;
    // initialForm.bank_id (число) приводим к строке
    setForm({
      ...initialForm,
      bank_id: initialForm.bank_id ? String(initialForm.bank_id) : ""
    });

    // заполнить photoList, если в initialForm.photos есть массив { id, url }
    if (initialForm.photos?.length) {
      setPhotoList(
        initialForm.photos.map(ph => ({
          id: ph.id,
          url: ph.url
        }))
      );
    }

    // подтянуть районы и комплексы для уже заданного города/района
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

  // 3.1. При смене города – сбрасываем район и комплекс
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

  // 3.2. При смене района – сбрасываем комплекс
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

  // 3.3. Универсальный обработчик для текстовых полей и чекбоксов
  const handleChange = e => {
    const { name, type, checked, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // 3.4. Выбор новых файлов (фото)
  const onFilesChange = e => {
    const files = Array.from(e.target.files);
    const newItems = files.map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f)
    }));
    setPhotoList(pl => [...pl, ...newItems]);
    e.target.value = null; // сброс input
  };

  // 3.5. Удаление фото по индексу
  const removePhoto = idx => {
    setPhotoList(pl => {
      const copy = [...pl];
      copy.splice(idx, 1);
      return copy;
    });
  };

  // 3.6. Drag&Drop для photoList
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

  // -------------------------------
  // 4. Отправка формы
  // -------------------------------
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 4.1. Валидация: если pledge === true, bank_id обязательно не пустая строка
      if (form.pledge && !form.bank_id) {
        throw new Error("Please select a bank when 'In pledge' is checked");
      }

      // 4.2. Собираем FormData
      const data = new FormData();
      // Текстовые поля
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
      data.append("name_appartment", form.name_appartment);
      data.set("ads_type", actionType === "sell" ? "1" : "2");

      // 4.3. Чекбокс pledge → "1" или "0"
      data.append("pledge", form.pledge ? "1" : "0");
      if (form.pledge) {
        data.append("bank_id", form.bank_id);  // строка, например "3"
      }

      // 4.4. Фото (new + existing)
      photoList.forEach(item => {
        if (item.file) {
          data.append("photos", item.file);
        } else if (item.id) {
          data.append("existing_photos[]", item.id);
        }
      });

      // 4.5. Посылаем запрос
      const url    = editMode
        ? `/api/v1/content/ads/my/${adId}`
        : `/api/v1/content/ads`;
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: data
      });
      if (res.status === 401) throw new Error("Please sign in");
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Server error: ${res.status}`);
      }
      onSuccess?.();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 5. JSX-разметка
  // -------------------------------
  return (
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

      {/* In pledge (чекбокс) */}
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

      {/* Если pledge = true, показываем <select> банков */}
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

      {/* Photos (Drag&Drop + превью) */}
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
                    src={item.url ?? item.previewUrl}
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
                    key={item.id ?? item.previewUrl}
                    draggableId={String(item.id ?? item.previewUrl)}
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
                          border: idx === 0 ? "2px solid green" : "1px solid #ccc",
                          borderRadius: 4,
                          overflow: "hidden",
                          opacity: snapshot.isDragging ? 0.6 : 1,
                          ...provided.draggableProps.style
                        }}
                      >
                        <img
                          src={item.url ?? item.previewUrl}
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

      {/* Submit button */}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (editMode ? "Updating…" : "Publishing…")
                  : (editMode ? "Update Listing" : "Publish")}
      </button>
    </form>
  );
};

export default ApartmentForm;
