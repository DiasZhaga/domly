// src/components/CustomModal.js
import React from "react";

/**
 * Простой информационный модал (одна кнопка «Close»)
 * Props:
 *   - title (string)
 *   - message (string)
 *   - onClose (function)
 */
export const InfoModal = ({ title, message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {title && <h2 className="modal-title">{title}</h2>}
        <p style={{ lineHeight: 1.6, marginBottom: "1.5rem" }}>{message}</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Простой подтверждающий модал (две кнопки: Cancel и Confirm)
 * Props:
 *   - title (string)
 *   - message (string)
 *   - onConfirm (function)
 *   - onCancel (function)
 *   - confirmLabel (string, optional) - текст на кнопке Confirm (по умолчанию «Confirm»)
 *   - cancelLabel (string, optional) - текст на кнопке Cancel (по умолчанию «Cancel»)
 */
export const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p style={{ lineHeight: 1.6, marginBottom: "1.5rem" }}>{message}</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
