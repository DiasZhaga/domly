package models

import "time"

type Developer struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	LogoURL     string    `json:"logo_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type DeveloperMessage struct {
	Message     string `form:"message"`
	ContactInfo string `form:"contact_info"`
}
