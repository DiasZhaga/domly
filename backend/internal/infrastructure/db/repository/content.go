package repository

import (
	"context"
	"database/sql"
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"fmt"
	"github.com/lib/pq"
	"go.uber.org/zap"
	"strings"
	"time"
)

type ContentRepository struct {
	db *sql.DB
}

func NewContentRepository(db *sql.DB) *ContentRepository {
	return &ContentRepository{
		db: db,
	}
}

func (r *ContentRepository) SaveNewAds(ctx context.Context, userId int, content models.Content) (int, error) {
    // Устанавливаем таймаут на выполнение SQL
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    // Делим логику: если pledge=false, передаём bankIDParam=nil
    var bankIDParam interface{}
    if content.Pledge {
        // Если контент.Pledge == true, используем content.BankID (>0)
        bankIDParam = content.BankID
    } else {
        // Если контент.Pledge == false, пишем NULL в поле bank_id
        bankIDParam = nil
    }

    // Поле StopedAt уже может быть установлено до вызова; 
    // по вашим примерам обычно оно := Now()+30 дней
    // Поле IsActive тоже уже, вероятно, true
    var adsId int
    err := r.db.QueryRowContext(dbCtx, saveNewAdsQuery,
        content.Title,
        content.NameAppartment,
        content.Square,
        content.NumRooms,
        content.Floor,
        content.YearConstruction,
        content.Address,
        content.Price,
        content.CeilingHeight,
        content.Description,
        userId,                 // $11 → author_id
        content.AdsType,        // $12 → ads_type
        content.IsActive,       // $13 → is_active
        content.StopedAt,       // $14 → stoped_at (time.Time)
        content.City,           // $15 → city
        content.District,       // $16 → district
        content.Pledge,         // $17 → pledge (bool)
        bankIDParam,            // $18 → bank_id (int или NULL)
    ).Scan(&adsId)
    if err != nil {
        zap.L().Error("error saving ads", zap.Error(err))
        return 0, err
    }
    return adsId, nil
}


func (c *ContentRepository) SaveNewPhoto(ctx context.Context, userId int, filename string, main bool) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	url := common.HostPhoto + filename

	if _, err := c.db.ExecContext(dbCtx, savePhotoQuery, userId, url, main); err != nil {
		zap.L().Error("error saving photo", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) SaveDocument(ctx context.Context, adsId int, filename string) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	url := common.HostPhoto + filename

	if _, err := c.db.ExecContext(dbCtx, saveDocQuery, adsId, url); err != nil {
		zap.L().Error("error saving photo", zap.Error(err))
		return err
	}
	return nil
}


func (c *ContentRepository) ListAds(
    ctx context.Context,
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
) ([]models.Content, error) {
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    base := defQuery
    var conds []string
    var args  []interface{}
    idx := 1

    if adsType != "" {
        conds = append(conds, fmt.Sprintf("ads.ads_type = $%d", idx))
        args = append(args, adsType); idx++
    }
    if city != "" {
        conds = append(conds, fmt.Sprintf("ads.city = $%d", idx))
        args = append(args, city); idx++
    }
    if district != "" {
        conds = append(conds, fmt.Sprintf("ads.district = $%d", idx))
        args = append(args, district); idx++
    }
    if complex != "" {
        conds = append(conds, fmt.Sprintf("ads.name_appartment = $%d", idx))
        args = append(args, complex); idx++
    }
    if len(rooms) > 0 {
        // IN ($N, $N+1, ...)
        placeholders := make([]string, len(rooms))
        for i, r := range rooms {
            placeholders[i] = fmt.Sprintf("$%d", idx)
            args = append(args, r)
            idx++
        }
        conds = append(conds, fmt.Sprintf("ads.num_rooms IN (%s)", strings.Join(placeholders, ",")))
    }
	if minPrice != "" {
		conds = append(conds, fmt.Sprintf("ads.price >= $%d", idx))
		args  = append(args, minPrice)
		idx++
	}
	if maxPrice != "" {
		conds = append(conds, fmt.Sprintf("ads.price <= $%d", idx))
		args  = append(args, maxPrice)
		idx++
	}
    if minArea != "" {
        conds = append(conds, fmt.Sprintf("ads.square >= $%d", idx))
        args = append(args, minArea); idx++
    }
    if maxArea != "" {
        conds = append(conds, fmt.Sprintf("ads.square <= $%d", idx))
        args = append(args, maxArea); idx++
    }
    if minYear != "" {
        conds = append(conds, fmt.Sprintf("ads.year_construction >= $%d", idx))
        args = append(args, minYear); idx++
    }
    if maxYear != "" {
        conds = append(conds, fmt.Sprintf("ads.year_construction <= $%d", idx))
        args = append(args, maxYear); idx++
    }
    if minFloor != "" {
        conds = append(conds, fmt.Sprintf("ads.floor >= $%d", idx))
        args = append(args, minFloor); idx++
    }
    if maxFloor != "" {
        conds = append(conds, fmt.Sprintf("ads.floor <= $%d", idx))
        args = append(args, maxFloor); idx++
    }
    if minCeil != "" {
        conds = append(conds, fmt.Sprintf("ads.ceiling_height >= $%d", idx))
        args = append(args, minCeil); idx++
    }
    if maxCeil != "" {
        conds = append(conds, fmt.Sprintf("ads.ceiling_height <= $%d", idx))
        args = append(args, maxCeil); idx++
    }
    switch pledge {
    case "true":
        conds = append(conds, "ads.pledge = true")
    case "false":
        conds = append(conds, "ads.pledge = false")
    }

    if len(conds) > 0 {
        base += " WHERE " + strings.Join(conds, " AND ")
    }
    base += " ORDER BY ads.created_at DESC"

    rows, err := c.db.QueryContext(dbCtx, base, args...)
    if err != nil {
        zap.L().Error("ListAds query failed", zap.Error(err))
        return nil, err
    }
    defer rows.Close()

    var out []models.Content
    for rows.Next() {
        var content models.Content
        var author  models.User

        if err := rows.Scan(
            &content.Id, &content.Title, &content.NameAppartment,
            &content.Square, &content.NumRooms, &content.Floor,
            &content.YearConstruction, &content.Address, &content.Price,
            &content.CeilingHeight, &content.Description, &content.CreatedAt,
            &content.AdsType, &content.IsActive, &content.StopedAt,
            &content.City, &content.District,
            &author.ID, &author.Login, &author.Name, &author.CreatedAt,
        ); err != nil {
            zap.L().Error("scan ListAds row failed", zap.Error(err))
            continue
        }
        content.Author = author

        // подтягиваем фото
        photoRows, _ := c.db.QueryContext(dbCtx, getPhotosByIdQuery, content.Id)
        for photoRows.Next() {
            var ph models.Photos
            if err := photoRows.Scan(&ph.Id, &ph.Url, &ph.MainURL); err == nil {
                content.UrlPhotos = append(content.UrlPhotos, ph)
            }
        }
        photoRows.Close()

        out = append(out, content)
    }

    return out, nil
}


func (c *ContentRepository) GetByIdAds(ctx context.Context, id int) (models.Content, error) {
    // 1) Контекст с таймаутом
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    // 2) Переменные для объявления и автора
    var content models.Content
    var author  models.User

    // 3) Расширенный запрос, который отдаёт и поля из auth_users
    err := c.db.QueryRowContext(dbCtx, getByIdAdsQuery, id).Scan(
        // поля объявления
        &content.Id,
        &content.Title,
        &content.NameAppartment,
        &content.Square,
        &content.NumRooms,
        &content.Floor,
        &content.YearConstruction,
        &content.Address,
        &content.Price,
        &content.CeilingHeight,
        &content.Description,
        &content.CreatedAt,
        &content.AdsType,
        &content.IsActive,
        &content.StopedAt,
        &content.City,
        &content.District,

        // поля автора (models.User)
       	&author.ID,
        &author.Login,
        &author.Name,
        &author.CreatedAt,
    )
    if err != nil {
        zap.L().Error("failed to get ad by id", zap.Error(err))
        return models.Content{}, err
    }

     content.Author = author

    // подтягиваем фото
    rows, err := c.db.QueryContext(dbCtx, getPhotosByIdQuery, content.Id)
    if err != nil {
        zap.L().Error("ошибка получения фото", zap.Error(err))
        return models.Content{}, err
    }
    defer rows.Close()

    for rows.Next() {
        var photo models.Photos
        if err := rows.Scan(&photo.Id, &photo.Url, &photo.MainURL); err == nil {
            content.UrlPhotos = append(content.UrlPhotos, photo)
        }
    }

    return content, nil
}


func (c *ContentRepository) GetMyAds(ctx context.Context, userId int) ([]models.Content, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	rows, err := c.db.QueryContext(dbCtx, getMyAdsQuery, userId)
	if err != nil {
		zap.L().Error("error get my  ads", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var contents []models.Content
	for rows.Next() {
		var content models.Content
		err := rows.Scan(
			&content.Id,
			&content.Title,
			&content.NameAppartment,
			&content.Square,
			&content.NumRooms,
			&content.Floor,
			&content.YearConstruction,
			&content.Address,
			&content.Price,
			&content.CeilingHeight,
			&content.Description,
			&content.CreatedAt,
			&content.AdsType,
			&content.IsActive,
			&content.StopedAt,
			&content.City,
			&content.District,
		)
		if err != nil {
			zap.L().Error("ошибка сканирования строки", zap.Error(err))
			continue
		}
		photoRows, err := c.db.QueryContext(dbCtx, getPhotoByIdQuery, content.Id)
		if err == nil {
			for photoRows.Next() {
				var photo models.Photos
				if err := photoRows.Scan(&photo.Id, &photo.Url, &photo.Type); err == nil {
					content.UrlPhotos = append(content.UrlPhotos, photo)
				}
			}
			photoRows.Close()
		}
		contents = append(contents, content)
	}
	return contents, nil
}

func (c *ContentRepository) GetDescOfAppart(ctx context.Context, id string) (models.DescriptionAppartment, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var content models.DescriptionAppartment
	var rawPeculiarities, rawComments, rawResidentsValue string

	err := c.db.QueryRowContext(dbCtx, getDescOfAppartQuery, id).Scan(
		&content.Id,
		&content.Name,
		&content.Description,
		&content.Address,
		&content.Floors,
		&content.Class,
		&content.Parking,
		&rawPeculiarities,
		&rawResidentsValue,
		&rawComments,
	)
	if err != nil {
		zap.L().Error("failed get description of appartment", zap.Error(err))
		return content, err
	}
	content.ResidentsValue = common.FilterNonEmpty(strings.Split(rawResidentsValue, ";"))
	content.Peculiarities = common.FilterNonEmpty(strings.Split(rawPeculiarities, ";"))
	rows, err := c.db.QueryContext(dbCtx, getCommentsQuery, content.Id)
	if err != nil {
		zap.L().Error("failed to load comments", zap.Error(err))
		return content, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.Comment
		if err := rows.Scan(&comment.Id, &comment.Comm); err != nil {
			zap.L().Error("failed to scan comment", zap.Error(err))
			continue
		}
		content.Comments = append(content.Comments, comment)
	}

	return content, nil
}

func (c *ContentRepository) DelComment(ctx context.Context, userId, commId int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, delCommQuery, commId, userId); err != nil {
		zap.L().Error("Ошибка при удалении комментария", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) GetByIdMyAds(ctx context.Context, id, userId int) (models.Content, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var content models.Content
	if err := c.db.QueryRowContext(dbCtx, getByIdMyAdsQuery, id, userId).Scan(
		&content.Id,
		&content.Title,
		&content.NameAppartment,
		&content.Square,
		&content.NumRooms,
		&content.Floor,
		&content.YearConstruction,
		&content.Address,
		&content.Price,
		&content.CeilingHeight,
		&content.Description,
		&content.CreatedAt,
		&content.AdsType,
		&content.IsActive,
		&content.StopedAt,
		&content.City,
		&content.District,
	); err != nil {
		zap.L().Error("failed get ads by id", zap.Error(err))
		return models.Content{}, err
	}
	rows, err := c.db.QueryContext(dbCtx, getPhotosByIdQuery, content.Id)
	if err != nil {
		zap.L().Error("ошибка получения фото", zap.Error(err))
		return models.Content{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var photo models.Photos
		if err := rows.Scan(&photo.Id, &photo.Url, &photo.Type); err == nil {
			content.UrlPhotos = append(content.UrlPhotos, photo)
		}
	}
	return content, nil
}

func (r *ContentRepository) UpdateByIdAds(ctx context.Context, id, userId int, content models.Content) error {
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    // В зависимости от content.Pledge формируем bankIDParam
    var bankIDParam interface{}
    if content.Pledge {
        bankIDParam = content.BankID  // какое-то целое > 0
    } else {
        bankIDParam = nil             // сбросим в NULL
    }

    _, err := r.db.ExecContext(dbCtx, updateByIdAdsQuery,
        content.Title,
        content.NameAppartment,
        content.Square,
        content.NumRooms,
        content.Floor,
        content.YearConstruction,
        content.Address,
        content.Price,
        content.CeilingHeight,
        content.Description,
        content.AdsType,
        content.City,
        content.District,
        content.Pledge,    // булево (true/false)
        bankIDParam,       // либо int>0, либо nil
        id,                // WHERE id = $16
        userId,            // AND author_id = $17
    )
    if err != nil {
        zap.L().Error("UpdateByIdAds failed", zap.Error(err))
        return err
    }
    return nil
}

func (c *ContentRepository) DeleteByIdPhoto(ctx context.Context, ids []int, id int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, deletePhotoQuery, id, pq.Array(ids)); err != nil {
		zap.L().Error("<UNK> <UNK> <UNK>", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) UpdateMainPhoto(ctx context.Context, id int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var hasMain bool
	if err := c.db.QueryRowContext(dbCtx, getMainPhotosQuery, id).Scan(&hasMain); err != nil {
		zap.L().Error("ошибка проверки is_main", zap.Error(err))
		return err
	}

	if !hasMain {
		if _, err := c.db.ExecContext(dbCtx, updateMainPhotoQuery, id); err != nil {
			zap.L().Error("ошибка установки новой главной фото", zap.Error(err))
			return err
		}
	}
	return nil
}

func (c *ContentRepository) DeleteByIdAds(ctx context.Context, id, userId int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	tx, err := c.db.BeginTx(dbCtx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(dbCtx, deletePhotoWithAdsQuery, id)
	if err != nil {
		zap.L().Error("удаление фото", zap.Error(err))
		return err
	}

	_, err = tx.ExecContext(dbCtx, deleteByIdAdsQuery, id)
	if err != nil {
		zap.L().Error("удаление объявления", zap.Error(err))
		return err
	}

	if err := tx.Commit(); err != nil {
		zap.L().Error("commit failed", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) UpdAllAds() ([]models.Content, error) {
	dbCtx, cancel := context.WithTimeout(context.Background(), common.TimeDbContext)
	defer cancel()

	rows, err := c.db.QueryContext(dbCtx, updAllAdsQuery)
	if err != nil {
		zap.L().Error("error saving ads", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var contents []models.Content
	for rows.Next() {
		var content models.Content
		err := rows.Scan(
			&content.Id,
			&content.CreatedAt,
			&content.IsActive,
			&content.StopedAt,
		)
		if err != nil {
			zap.L().Error("ошибка сканирования строки", zap.Error(err))
			continue
		}
		contents = append(contents, content)
	}
	return contents, nil
}

func (c *ContentRepository) DeactiveAds(id string) error {
	dbCtx, cancel := context.WithTimeout(context.Background(), common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, deactiveAdsQuery, id); err != nil {
		return err
	}
	return nil
}

func (c *ContentRepository) SaveMess(ctx context.Context, receivId int, content string, userId int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, saveMessQuery, userId, receivId, content); err != nil {
		zap.L().Error("DB insert failed", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) GetStats(ctx context.Context) models.MessageStats {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var stats models.MessageStats
	row := c.db.QueryRowContext(dbCtx, getStatsQuery)
	err := row.Scan(&stats.TotalMessages, &stats.ActiveUsers, &stats.AvgLength)
	if err != nil {
		zap.L().Error("не удалось получить статистику сообщений", zap.Error(err))
	}
	rows, err := c.db.QueryContext(dbCtx, getStatsTopQuery)
	if err != nil {
		zap.L().Error("не удалось получить топ отправителей", zap.Error(err))
		return stats
	}
	defer rows.Close()

	for rows.Next() {
		var rec models.TopSenderRecord
		if err := rows.Scan(&rec.UserID, &rec.Count); err == nil {
			stats.TopSenders = append(stats.TopSenders, rec)
		}
	}

	return stats
}
func (c *ContentRepository) GetHistory(ctx context.Context, user1, user2, limit, offset int) []models.Message {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var result []models.Message

	rows, err := c.db.QueryContext(dbCtx, getHistoryQuery, user1, user2, limit, offset)
	if err != nil {
		zap.L().Error("ошибка при получении истории сообщений", zap.Error(err))
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var m models.Message
		if err := rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.CreatedAt); err == nil {
			result = append(result, m)
		}
	}

	return result
}

func (c *ContentRepository) GetDialogs(ctx context.Context, userID int) []models.DialogPreview {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	dialogMap := make(map[int]models.DialogPreview)
	var result []models.DialogPreview

	rows, err := c.db.QueryContext(dbCtx, getDialogsQuery, userID)
	if err != nil {
		zap.L().Error("ошибка получения диалогов с пользователями", zap.Error(err))
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var d models.DialogPreview
		if err := rows.Scan(&d.UserID, &d.Name, &d.LastMessage, &d.LastTime); err == nil {
			// чтобы не дублировать диалоги
			if _, exists := dialogMap[d.UserID]; !exists {
				dialogMap[d.UserID] = d
			}
		}
	}

	for _, d := range dialogMap {
		result = append(result, d)
	}
	return result
}

func (c *ContentRepository) SearchMessages(ctx context.Context, text string, userId int, user2 string) []models.Message {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var result []models.Message
	if user2 != "" {
		rows, err := c.db.QueryContext(dbCtx, getSearchChatQuery, userId, user2, text)
		if err != nil {
			zap.L().Error("ошибка поиска сообщений", zap.Error(err))
			return result
		}
		defer rows.Close()
		for rows.Next() {
			var m models.Message
			if err := rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.CreatedAt); err == nil {
				result = append(result, m)
			}
		}
	} else {
		rows, err := c.db.QueryContext(dbCtx, getSearchQuery, userId, text)
		if err != nil {
			zap.L().Error("ошибка поиска сообщений", zap.Error(err))
			return result
		}
		defer rows.Close()
		for rows.Next() {
			var m models.Message
			if err := rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.CreatedAt); err == nil {
				result = append(result, m)
			}
		}
	}

	return result
}

func (c *ContentRepository) GetPledgeAds(ctx context.Context) ([]models.Content, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	rows, err := c.db.QueryContext(dbCtx, getPledgeQuery)
    if err != nil {
        zap.L().Error("error getting pledge ads", zap.Error(err))
        return nil, err
    }
    defer rows.Close()

    var contents []models.Content
    for rows.Next() {
        var content models.Content
        // models.User для автора
        var author models.User

        // Сканируем ВСЕ поля в том порядке, в каком они идут в getPledgeQuery
        if err := rows.Scan(
            &content.Id,
            &content.Title,
            &content.NameAppartment,
            &content.Square,
            &content.NumRooms,
            &content.Floor,
            &content.YearConstruction,
            &content.Address,
            &content.Price,
            &content.CeilingHeight,
            &content.Description,
            &content.CreatedAt,
            &content.AdsType,
            &content.IsActive,
            &content.StopedAt,
            &content.City,
            &content.District,
            &content.BankID,           // поле bank
            &author.ID,              // поля автора
            &author.Login,
            &author.Name,
            &author.CreatedAt,
        ); err != nil {
            zap.L().Error("ошибка сканирования pledge-строки", zap.Error(err))
            continue
        }

        // Кладём прочитанный User
        content.Author = author

        // Подтягиваем фото
        photoRows, err := c.db.QueryContext(dbCtx, getPhotoByIdQuery, content.Id)
        if err == nil {
            for photoRows.Next() {
                var photo models.Photos
                if err := photoRows.Scan(&photo.Id, &photo.Url, &photo.MainURL); err == nil {
                    content.UrlPhotos = append(content.UrlPhotos, photo)
                }
            }
            photoRows.Close()
        }

        contents = append(contents, content)
    }

    return contents, nil
}

func (c *ContentRepository) GetAllDevelopers(ctx context.Context) ([]models.Developer, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	rows, err := c.db.QueryContext(dbCtx, getAllDevelopersQuery)
	if err != nil {
		zap.L().Error("ошибка получения списка застройщиков", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var developers []models.Developer

	for rows.Next() {
		var dev models.Developer
		if err := rows.Scan(
			&dev.ID,
			&dev.Name,
			&dev.Description,
			&dev.Phone,
			&dev.Email,
			&dev.LogoURL,
			&dev.CreatedAt,
		); err != nil {
			zap.L().Error("ошибка сканирования застройщика", zap.Error(err))
			continue
		}
		developers = append(developers, dev)
	}

	return developers, nil
}

func (c *ContentRepository) SaveDeveloperMessage(ctx context.Context, developerID, userID int, msg models.DeveloperMessage) error {
	dbCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, saveDeveloperMessageQuery, developerID, userID, msg.Message, msg.ContactInfo); err != nil {
		zap.L().Error("ошибка сохранения сообщения застройщику", zap.Error(err))
		return err
	}

	return nil
}

func (c *ContentRepository) ListByDistrict(ctx context.Context, districtID int) ([]models.DescriptionAppartment, error) {
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    rows, err := c.db.QueryContext(dbCtx, getApartmentsByDistrictQuery, districtID)
    if err != nil {
        zap.L().Error("failed to list apartments", zap.Error(err))
        return nil, err
    }
    defer rows.Close()

    var list []models.DescriptionAppartment
    for rows.Next() {
        var apt models.DescriptionAppartment
        var rawPec, rawRes, rawCom string

        if err := rows.Scan(
            &apt.Id,
            &apt.Name,
            &apt.Description,
            &apt.Address,
            &apt.Floors,
            &apt.Class,
            &apt.Parking,
            &rawPec,
            &rawRes,
            &rawCom,
            &apt.DistrictID,
        ); err != nil {
            zap.L().Error("scan apartment failed", zap.Error(err))
            continue
        }

        // Преобразуем rawPec и rawRes как раньше:
        apt.Peculiarities  = common.FilterNonEmpty(strings.Split(rawPec, ";"))
        apt.ResidentsValue = common.FilterNonEmpty(strings.Split(rawRes, ";"))

        // rawCom — строка вида "comment1;comment2;comment3"
        // Сначала получаем []string
        commentsStr := common.FilterNonEmpty(strings.Split(rawCom, ";"))
        // Затем преобразуем каждый элемент в models.Comment
        comments := make([]models.Comment, 0, len(commentsStr))
        for _, cmt := range commentsStr {
            comments = append(comments, models.Comment{
                Comm: cmt,
                // Если вам нужно заполнять Id, можно парсить его либо оставлять пустым
                // Id: "", 
            })
        }
        apt.Comments = comments

        list = append(list, apt)
    }
    return list, nil
}

func (c *ContentRepository) GetByID(ctx context.Context, id string) (models.DescriptionAppartment, error) {
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    var apt models.DescriptionAppartment
    var rawPec, rawRes, rawCom string

    err := c.db.QueryRowContext(dbCtx, getApartmentByIDQuery, id).Scan(
        &apt.Id,
        &apt.Name,
        &apt.Description,
        &apt.Address,
        &apt.Floors,
        &apt.Class,
        &apt.Parking,
        &rawPec,
        &rawRes,
        &rawCom,
        &apt.DistrictID,
    )
    if err != nil {
        zap.L().Error("failed to fetch apartment", zap.Error(err))
        return apt, err
    }

    apt.Peculiarities  = common.FilterNonEmpty(strings.Split(rawPec, ";"))
    apt.ResidentsValue = common.FilterNonEmpty(strings.Split(rawRes, ";"))

    commentsStr := common.FilterNonEmpty(strings.Split(rawCom, ";"))
    comments := make([]models.Comment, 0, len(commentsStr))
    for _, cmt := range commentsStr {
        comments = append(comments, models.Comment{
            Comm: cmt,
        })
    }
    apt.Comments = comments

    return apt, nil
}


func (c *ContentRepository) GetAllCities(ctx context.Context) ([]models.City, error) {
  dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
  defer cancel()

  rows, err := c.db.QueryContext(dbCtx, getAllCitiesQuery)
  if err != nil {
    zap.L().Error("failed to query cities", zap.Error(err))
    return nil, err
  }
  defer rows.Close()

  var result []models.City
  for rows.Next() {
    var city models.City
    if err := rows.Scan(&city.ID, &city.Name); err != nil {
      zap.L().Error("scan city failed", zap.Error(err))
      continue
    }
    result = append(result, city)
  }
  return result, nil
}

// GetDistrictsByCity возвращает список районов для переданного cityID
func (c *ContentRepository) GetDistrictsByCity(ctx context.Context, cityID int) ([]models.District, error) {
  dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
  defer cancel()

  rows, err := c.db.QueryContext(dbCtx, getDistrictsByCityQuery, cityID)
  if err != nil {
    zap.L().Error("failed to query districts", zap.Error(err))
    return nil, err
  }
  defer rows.Close()

  var result []models.District
  for rows.Next() {
    var d models.District
    if err := rows.Scan(&d.ID, &d.CityID, &d.Name); err != nil {
      zap.L().Error("scan district failed", zap.Error(err))
      continue
    }
    result = append(result, d)
  }
  return result, nil
}

func (c *ContentRepository) AddComment(ctx context.Context, userId, appartId int, comment string) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, addNewCommQuery, appartId, userId, comment); err != nil {
		zap.L().Error("Error adding comment", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) AddingBalance(ctx context.Context, userId int, amount float64) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := c.db.ExecContext(dbCtx, addingBalanceQuery, amount, userId); err != nil {
		zap.L().Error("error adding balance", zap.Error(err))
		return err
	}
	return nil
}

func (c *ContentRepository) BuySubscribe(ctx context.Context, userId int, idSub string) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var countMoney, price float64
	var StopedAt time.Time

	if idSub == "1" {
		StopedAt = time.Now().AddDate(0, 0, 30)
		price = common.PriceSub
	} else {
		StopedAt = time.Now().AddDate(0, 0, 180)
		price = common.PriceSubPro
	}

	if err := c.db.QueryRowContext(dbCtx, countMoneyQuery, userId).Scan(&countMoney); err != nil {
		zap.L().Error("Failed when requesting the money", zap.Error(err))
		return err
	}
	if countMoney >= price {
		countMoney = countMoney - price
		if _, err := c.db.ExecContext(dbCtx, buySubscribeQuery, countMoney, StopedAt, userId); err != nil {
			zap.L().Error("Failed when calculating money", zap.Error(err))
			return err
		}
		return nil
	} else {
		zap.L().Error("Few money")
		return common.NotEnoughMoney
	}
}

func (c *ContentRepository) BuyApartment(ctx context.Context, userId, apartmentId, sellerId int, sum float64) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var countMoney float64
	tx, err := c.db.BeginTx(dbCtx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			if err = tx.Rollback(); err != nil {
				zap.L().Error("Failed to rollback transaction", zap.Error(err))
			}
			return
		}
		if err = tx.Commit(); err != nil {
			zap.L().Error("Failed to commit", zap.Error(err))
		}
	}()

	if err := tx.QueryRowContext(dbCtx, countMoneyQuery, userId).Scan(&countMoney); err != nil {
		zap.L().Error("Failed when requesting the money", zap.Error(err))
		return err
	}

	priceWithPercent := sum + sum*0.003
	waitingAt := time.Now().AddDate(0, 0, 3)
	if countMoney >= priceWithPercent {
		if _, err := tx.ExecContext(dbCtx, changesStatusQuery, apartmentId); err != nil {
			zap.L().Error("Failed when changing apartment status", zap.Error(err))
			return err
		}
		rest := countMoney - priceWithPercent
		if _, err := tx.ExecContext(dbCtx, changesBalanceQuery, rest, userId); err != nil {
			zap.L().Error("Failed when changing balance status", zap.Error(err))
			return err
		}
		if _, err := tx.ExecContext(dbCtx, addDealQuery, apartmentId, userId, sellerId, sum, waitingAt, priceWithPercent); err != nil {
			zap.L().Error("Failed when adding deal status", zap.Error(err))
			return err
		}
		return nil
	} else {
		zap.L().Error("Few money")
		return common.NotEnoughMoney
	}
}

func (c *ContentRepository) ProofOfPurchase(ctx context.Context, userId int, status string, salesId, sellerId int, sum float64) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	tx, err := c.db.BeginTx(dbCtx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			if err = tx.Rollback(); err != nil {
				zap.L().Error("Failed to rollback transaction", zap.Error(err))
			}
			return
		}
		if err = tx.Commit(); err != nil {
			zap.L().Error("Failed to commit", zap.Error(err))
		}
	}()

	switch status {
	case "true":
		if _, err := tx.ExecContext(dbCtx, proofOfPurchaseQuery, status, salesId, userId); err != nil {
			zap.L().Error("Failed when requesting the proofOfPurchase", zap.Error(err))
			return err
		}
		sumWithPrecent := sum - sum*0.003
		if _, err := tx.ExecContext(dbCtx, addingBalanceOfSeller, sumWithPrecent, sellerId); err != nil {
			zap.L().Error("Failed when changing proofOfPurchase", zap.Error(err))
			return err
		}
	case "false":
		if _, err := tx.ExecContext(dbCtx, returnBalanceQuery, userId, salesId); err != nil {
			zap.L().Error("Failed when changing balance status", zap.Error(err))
			return err
		}
		if _, err = tx.ExecContext(dbCtx, canceledBuyQuery, salesId); err != nil {
			zap.L().Error("failed changes status", zap.Error(err))
			return err
		}

	}
	return nil
}

func (c *ContentRepository) GetConfirmationOfUser(ctx context.Context, userId int) ([]models.Sales, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	rows, err := c.db.QueryContext(dbCtx, confirmationOfUserQuery, userId)
	if err != nil {
		zap.L().Error("error getting ads with filters", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	var sales []models.Sales
	for rows.Next() {
		var sale models.Sales
		err := rows.Scan(
			&sale.Id,
			&sale.IdAds,
			&sale.BuyerId.Id,
			&sale.BuyerId.Name,
			&sale.SellerId.Id,
			&sale.SellerId.Name,
			&sale.StatusPurchase,
			&sale.PurchaseAmount,
			&sale.ConfirmedAt,
			&sale.PurchaseCancelled,
			&sale.PricewWithService,
		)
		if err != nil {
			zap.L().Error("ошибка сканирования строки", zap.Error(err))
			continue
		}
		sales = append(sales, sale)
	}
	return sales, nil
}
