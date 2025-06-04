// src/pages/EditPhotosPage.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link }       from "react-router-dom";
import Layout                    from "../components/Layout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function EditPhotosPage() {
  const { id } = useParams();
  const fileInputRef = useRef();
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  // Загрузка существующих фото
  useEffect(() => {
    fetch(`/api/v1/content/ads/${id}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(r => r.json())
      .then(data => setPhotos(data.url_photos || []))
      .catch(console.error);
  }, [id]);

  // Добавление новых файлов
  const onNewFiles = async e => {
  try {
    const files = Array.from(e.target.files);
    const form  = new FormData();
    files.forEach(f => form.append("photos", f));
    await fetch(`/api/v1/content/ads/my/${id}/photos`, {
      method:      "POST",
      credentials: "include",
      body:        form,
    });
    // ре-фетчим свежие url_photos
    const fresh = await fetch(
      `/api/v1/content/ads/${id}`, 
      { credentials: "include", headers: { Accept: "application/json" } }
    ).then(r => r.json());
    setPhotos(fresh.url_photos || []);
  } catch (err) {
    console.error(err);
  }
};

  // Удаление фото
  const removePhoto = async photoId => {
  try {
    await fetch(
      `/api/v1/content/ads/my/${id}/photos/${photoId}`, 
      { method: "DELETE", credentials: "include" }
    );
    // сразу ре-фетчим свежие url_photos
    const fresh = await fetch(
      `/api/v1/content/ads/${id}`, 
      { credentials: "include", headers: { Accept: "application/json" } }
    ).then(r => r.json());
    setPhotos(fresh.url_photos || []);
  } catch (err) {
    console.error(err);
  }
};

  // Сохранение порядка
const saveOrder = async () => {
    setSaving(true);
    try {
        await fetch(`/api/v1/content/ads/my/${id}/photos/reorder`, {
        method:      "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
            order: photos.map(p => p.id),
            main:  photos.length ? photos[0].id : null
            })
        });
        // не alert, а можно перезагрузить порядок с сервера:
        // const fresh = await fetch(`/api/v1/content/ads/${id}`, …).then(r=>r.json());
        // setPhotos(fresh.url_photos);
    } catch (err) {
        console.error("Не удалось сохранить порядок", err);
    } finally {
        setSaving(false);
    }
    };
  // Обработчик drag&drop
  const onDragEnd = result => {
    if (!result.destination) return;
    const reordered = Array.from(photos);
    const [moved]   = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPhotos(reordered);
  };

  return (
    <Layout>
      <div className="container py-5">
        <Link to="/my-ads" className="mb-4 d-inline-block">← Back to My Listings</Link>
        <h2 className="mb-4">Edit Photos for Ad #{id}</h2>

        {/* кнопка Добавить */}
        <button
          type="button"
          className="btn btn-outline-primary mb-3"
          onClick={() => fileInputRef.current.click()}
        >
          + Add Photo
        </button>
        <input
          type="file"
          multiple
          className="d-none"
          ref={fileInputRef}
          onChange={onNewFiles}
        />

        {/* Drag & Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
            droppableId="photos"
            direction="horizontal"

            // вот тут мы говорим: «когда начинается drag, не используйте дефолтный preview,
            // а вместо него отрисуй этот блок»
            renderClone={(providedClone, snapshotClone, rubric) => {
            const photo = photos[rubric.source.index];
            return (
                <div
                ref={providedClone.innerRef}
                {...providedClone.draggableProps}
                {...providedClone.dragHandleProps}
                style={{
                    width: 120,
                    height: 90,
                    // сюда же применяем transform/transition из библиотеки
                    ...providedClone.draggableProps.style,
                    // и «прищёлкиваем» его прямо по курсору
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                }}
                >
                <img
                    src={`/ads-photos/${photo.url}`}
                    alt=""
                    style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    border: rubric.source.index === 0
                        ? "2px solid green"
                        : "1px solid #ccc",
                    borderRadius: 4,
                    }}
                />
                </div>
            );
            }}
        >
            {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="d-flex flex-row flex-wrap"
            >
                {photos.map((photo, index) => (
                <Draggable
                    key={photo.id}
                    draggableId={String(photo.id)}
                    index={index}
                >
                    {(providedDraggable, snapshotDraggable) => (
                    <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className="position-relative me-2 mb-2"
                        style={{
                        width: 120,
                        height: 90,
                        ...providedDraggable.draggableProps.style,
                        transition: snapshotDraggable.isDragging
                            ? "none"
                            : "transform 200ms ease",
                        }}
                    >
                        <img
                        src={`/ads-photos/${photo.url}`}
                        alt=""
                        className="img-fluid rounded"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            border:
                            index === 0 ? "2px solid green" : "1px solid #ccc",
                        }}
                        />
                        <button
                        type="button"
                        className="btn-close btn-sm position-absolute top-0 end-0"
                        onClick={() => removePhoto(photo.id)}
                        />
                        {index === 0 && (
                        <span className="badge bg-success position-absolute bottom-0 start-0">
                            Main
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


        {/* Сохранить порядок */}
        <button
          className="btn btn-primary mt-4"
          onClick={saveOrder}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save photos"}
        </button>
      </div>
    </Layout>
  );
}
