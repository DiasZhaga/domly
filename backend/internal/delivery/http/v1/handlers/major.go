package handlers

import (
	"diplom/internal/domain/interfaces"
)

type Handler struct {
	stripeSecretKey  string
    stripeWebhookKey string
	majorRepository   interfaces.MajorRepositoryI
	contentRepository interfaces.ContentRepositoryI
	minioRepository   interfaces.MinioRepositoryI
}

func NewHandler(
    stripeSecret string,
    stripeWebhook string,
    majorRepo interfaces.MajorRepositoryI,
    contentRepo interfaces.ContentRepositoryI,
    minioRepo interfaces.MinioRepositoryI,
) *Handler {
    return &Handler{
        stripeSecretKey:   stripeSecret,
        stripeWebhookKey:  stripeWebhook,
        majorRepository:   majorRepo,
        contentRepository: contentRepo,
        minioRepository:   minioRepo,
    }
}
