// backend/internal/delivery/http/v1/handlers/major.go
package handlers

import (
    "diplom/internal/domain/interfaces"
)

type Handler struct {
    stripeSecretKey  string
    stripeWebhookKey string

    majorRepository   interfaces.MajorRepositoryI
    contentRepository interfaces.ContentRepositoryI

    // Раньше было только одно:
    // minioRepository interfaces.MinioRepositoryI

    // Теперь — два поля:
    photoMinioRepo interfaces.MinioRepositoryI
    docMinioRepo   interfaces.MinioRepositoryI
}

// Меняем конструктор NewHandler так, чтобы туда передавалось два репозитория:
func NewHandler(
    stripeSecret string,
    stripeWebhook string,
    majorRepo interfaces.MajorRepositoryI,
    contentRepo interfaces.ContentRepositoryI,
    photoMinioRepo interfaces.MinioRepositoryI,
    docMinioRepo interfaces.MinioRepositoryI,
) *Handler {
    return &Handler{
        stripeSecretKey:   stripeSecret,
        stripeWebhookKey:  stripeWebhook,
        majorRepository:   majorRepo,
        contentRepository: contentRepo,
        photoMinioRepo:    photoMinioRepo,
        docMinioRepo:      docMinioRepo,
    }
}
