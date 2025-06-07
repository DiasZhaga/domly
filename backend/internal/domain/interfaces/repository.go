package interfaces

import (
	"context"
	"diplom/internal/domain/models"
	"io"
	"time"
)

type MajorRepositoryI interface {
	MatchСheckLogin(ctx context.Context, login string) (bool, error)
	RegisterNewUser(ctx context.Context, login, password, name string) error

	GetPassInDb(ctx context.Context, login string) (int, string, error)
	GetUserByID(ctx context.Context, id int) (models.User, error)
	SaveCookieToken(ctx context.Context, id int, token string) error

	CheckingLiveCookie(ctx context.Context, token string) (int, time.Time, error)
	DeleteCookie(ctx context.Context, id int) error
}

type MinioRepositoryI interface {
	UploadFile(data []byte, objectName string, status int) error
	GetObject(objectName string) (io.ReadCloser, error)
}

type ContentRepositoryI interface {
	SaveNewAds(ctx context.Context, userId int, content models.Content) (int, error)
	SaveNewPhoto(ctx context.Context, userId int, filename string, main bool) error
	SaveDocument(ctx context.Context, adsId int, filename string) error

	ListAds(
		ctx       context.Context,
		adsType   string,
		city      string,
		district  string,
		complex   string,
		rooms     []string,
		minPrice  string,
		maxPrice  string,
		minArea   string,
		maxArea   string,
		minYear   string,
		maxYear   string,
		minFloor  string,
		maxFloor  string,
		minCeil   string,
		maxCeil   string,
		pledge    string,
		) ([]models.Content, error)
	GetByIdAds(ctx context.Context, id int) (models.Content, error)
	GetDescOfAppart(ctx context.Context, id string) (models.DescriptionAppartment, error)

	GetMyAds(ctx context.Context, userId int) ([]models.Content, error)
	GetByIdMyAds(ctx context.Context, id, userId int) (models.Content, error)

	UpdateByIdAds(ctx context.Context, id, userId int, content models.Content) error
	DeleteByIdPhoto(ctx context.Context, idsToDelete []int, id int) error
	UpdateMainPhoto(ctx context.Context, id int) error

	DeleteByIdAds(ctx context.Context, id, userId int) error

	UpdAllAds() ([]models.Content, error)
	DeactiveAds(id string) error

	SaveMess(ctx context.Context, receivId int, content string, userId int) error
	GetStats(ctx context.Context) models.MessageStats
	GetHistory(ctx context.Context, user1, user2, limit, offset int) []models.Message
	GetDialogs(ctx context.Context, userID int) []models.DialogPreview
	SearchMessages(ctx context.Context, text string, userId int, user2 string) []models.Message

	GetPledgeAds(ctx context.Context) ([]models.Content, error)

	GetAllDevelopers(ctx context.Context) ([]models.Developer, error)
	SaveDeveloperMessage(ctx context.Context, developerID, userID int, msg models.DeveloperMessage) error

	ListByDistrict(ctx context.Context, districtID int) ([]models.DescriptionAppartment, error)
  	GetByID(ctx context.Context, id string) (models.DescriptionAppartment, error)

	GetAllCities(ctx context.Context) ([]models.City, error)
  	GetDistrictsByCity(ctx context.Context, cityID int) ([]models.District, error)

	// ListPhotos(ctx context.Context, adID int) ([]models.Photos, error)
	// AddPhoto(ctx context.Context, userID, adID int, filename string, isMain bool) (models.Photos, error)
	// DeletePhoto(ctx context.Context, adID, photoID int) error
	// ReorderPhotos(ctx context.Context, adID int, ids []int) error

	AddComment(ctx context.Context, userId, appartId int, comment string) error
	DelComment(ctx context.Context, userId, commId int) error

	CheckSubscribe(ctx context.Context, userId int) bool

	AddingBalance(ctx context.Context, userId int, amount float64) error
	BuySubscribe(ctx context.Context, userId int, idSub string) error
	BuyApartment(ctx context.Context, userId, apartmentId, sellerId int, sum float64) error
	GetSalesBySeller(ctx context.Context, sellerId int) ([]models.Sales, error)

	ProofOfPurchase(ctx context.Context, userId int, status string, salesId, sellerId int, sum float64) error
	GetConfirmationOfUser(ctx context.Context, userId int) ([]models.Sales, error)

	GetBanks(ctx context.Context) ([]models.Bank, error)
}
