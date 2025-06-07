package models

import (
	"diplom/internal/common"
	"errors"
	"time"
)

type Content struct {
	Id                    string                `json:"id,omitempty"`
	Title                 string                `form:"title" json:"title"`
	NameAppartment        string                `form:"name_appartment" json:"name_appartment"`
	Square                string                `form:"square"  json:"square"`
	NumRooms              string                `form:"num_rooms"   json:"num_rooms"`
	Floor                 string                `form:"floor"       json:"floor"`
	YearConstruction      string                `form:"year_construction"  json:"year_construction"`
	Address               string                `form:"address"   json:"address"`
	Price                 string                `form:"price"       json:"price"`
	CeilingHeight         string                `form:"ceiling_height"  json:"ceiling_height"`
	Description           string                `form:"description"    json:"description"`
	DeletePhotoIDs        []string              `form:"delete_ids[]"`
	UrlPhotos             []Photos              `json:"url_photos,omitempty"`
	CreatedAt             time.Time             `json:"created_at"`
	AdsType               string                `form:"ads_type" json:"ads_type"`
	IsActive              bool                  `form:"is_activejson:" json:"is_active"`
	StopedAt              time.Time             `form:"stoped_at" json:"stoped_at"`
	City                  string                `form:"city" json:"city"`
	District              string                `form:"district" json:"district"`
	Pledge                bool                  `form:"pledge" json:"pledge,omitempty"` // теперь bool
	BankID                int                   `form:"bank_id" json:"bank_id,omitempty"`
	BankName              string                `json:"bank_name,omitempty"`
	DescriptionAppartment DescriptionAppartment `json:"description_appartment,omitempty"`
	Author                User                  `json:"author,omitempty"`
}

type Author struct {
	Id   int    `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

type Sales struct {
	Id                int       `json:"id,omitempty"`
	IdAds             int       `json:"id_ads,omitempty"`
	BuyerId           Author    `json:"buyer_id,omitempty"`
	SellerId          Author    `json:"seller_id,omitempty"`
	StatusPurchase    bool      `json:"status_purchase,omitempty"`
	PurchaseAmount    string    `json:"purchase_amount,omitempty"`
	ConfirmedAt       time.Time `json:"confirmation_waiting_date,omitempty"`
	PurchaseCancelled bool      `json:"purchase_cancelled,omitempty"`
	PricewWithService string    `json:"pricew_with_service,omitempty"`
}

type DescriptionAppartment struct {
	Id             string    `json:"id,omitempty"`
	Name           string    `json:"name,omitempty"`
	Description    string    `json:"description,omitempty"`
	Address        string    `json:"address,omitempty"`
	Floors         string    `json:"floors,omitempty"`
	Class          string    `json:"class,omitempty"`
	Parking        string    `json:"parking,omitempty"`
	Peculiarities  []string  `json:"peculiarities,omitempty"`
	ResidentsValue []string  `json:"residents_value,omitempty"`
	Comments       []Comment `json:"comments,omitempty"`
	DistrictID     int       `json:"district_id"`
}

type Comment struct {
	Id   string `json:"id,omitempty"`
	Comm string `json:"comment,omitempty"`
}

type CommentAppart struct {
	Id       int    `json:"id"`
	UserId   int    `json:"user_id"`
	Username string `json:"username"`
	Comm     string `json:"comment"`
}

type Photos struct {
	Id      string `json:"id,omitempty"`
	Url     string `json:"url,omitempty"`
	Type    bool   `json:"type,omitempty"`
	MainURL bool   `json:"main_url,omitempty"`
}

type City struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
type District struct {
	ID     int    `json:"id"`
	CityID int    `json:"city_id"`
	Name   string `json:"name"`
}

type Bank struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Apartment struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Description    string   `json:"description,omitempty"`
	Address        string   `json:"address,omitempty"`
	Floors         string   `json:"floors,omitempty"`
	Class          string   `json:"class,omitempty"`
	Parking        string   `json:"parking,omitempty"`
	Peculiarities  []string `json:"peculiarities,omitempty"`
	ResidentsValue []string `json:"residents_value,omitempty"`
	Comments       []string `json:"comments,omitempty"`
	DistrictID     int      `json:"district_id"`
}

type User struct {
	ID        int        `json:"id"`
	Login     string     `json:"login"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	Subscribe bool       `json:"subscribe"`
	StopedAt  *time.Time `json:"stoped_at,omitempty"`
	Balance   float64    `json:"balance"`
}

func (content *Content) ChekingCorrectness() error {
	if content.Title == "" || content.NameAppartment == "" || content.Square == "" || content.NumRooms == "" || content.Floor ==
		"" || content.YearConstruction == "" || content.CeilingHeight == "" || content.Price == "" || content.Address == "" || content.AdsType == "" || content.City == "" || content.District == "" {
		return common.EmptyDataError
	}
	if len(content.Description) > common.MaxDescriptionLength {
		return common.LenDescError
	}
	if len(content.Title) > common.MaxTtileLength {
		return common.LenTitleError
	}
	if content.Pledge && content.BankID <= 0 {
		return errors.New("bank_id must be provided when pledge = true")
	}
	if !content.Pledge {
		content.BankID = 0 // или оставить, в SQL вставим NULL
	}

	return nil
}
