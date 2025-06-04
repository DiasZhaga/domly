package models

import "time"

type MessageStats struct {
	TotalMessages int               `json:"total_messages"`
	ActiveUsers   int               `json:"active_users"`
	AvgLength     float64           `json:"average_length"`
	TopSenders    []TopSenderRecord `json:"top_senders"`
}
type TopSenderRecord struct {
	UserID int `json:"user_id"`
	Count  int `json:"count"`
}

type Message struct {
	ID         int       `json:"id"`
	SenderID   int       `json:"sender_id"`
	ReceiverID int       `json:"receiver_id"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

type DialogPreview struct {
	UserID      int       `json:"user_id"`
	Name        string    `json:"name"`
	LastMessage string    `json:"last_message"`
	LastTime    time.Time `json:"last_time"`
}

type StatusOnline struct{}
