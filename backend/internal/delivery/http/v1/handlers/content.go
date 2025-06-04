package handlers

import (
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"database/sql"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"time"
)

func (h *Handler) SubmitAnAds(c *gin.Context) {
    ctx := c.Request.Context()
    var content models.Content

    // 1) Получаем userID из middleware (AuthMiddleware кладёт его в контекст)
    userID := c.GetInt(common.KeySet)

    // 2) Биндим все form-поля в структуру models.Content
    if err := c.ShouldBind(&content); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form data"})
        return
    }

    // 3) Валидация: проверяем обязательные поля, в том числе логику pledge/bank_id
    if err := content.ChekingCorrectness(); err != nil {
        // Здесь вы можете разложить разные ошибки, как делали раньше.
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 4) Устанавливаем системные поля (если их нет в content)
    content.StopedAt = time.Now().AddDate(0, 0, 30)
    content.IsActive = true

    // 5) Создаём новую запись в таблице ads
    adsID, err := h.contentRepository.SaveNewAds(ctx, userID, content)
    if err != nil {
        zap.L().Error("save new ad failed", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save ad"})
        return
    }

    // 6) Если фотографии не были загружены, возвращаем ответ без них
    form, err := c.MultipartForm()
    if err != nil || len(form.File["photos"]) == 0 {
        zap.L().Warn("photos were not uploaded")
        c.JSON(http.StatusCreated, gin.H{
            "id":              adsID,
            "photos_uploaded": false,
        })
        return
    }

    // 7) Загружаем каждую фотографию (логика не менялась)
    for i, fileHeader := range form.File["photos"] {
        f, err := fileHeader.Open()
        if err != nil {
            zap.L().Error("error opening photo", zap.Error(err))
            continue
        }
        data, err := io.ReadAll(f)
        f.Close()
        if err != nil {
            zap.L().Error("error reading photo", zap.Error(err))
            continue
        }

        isMain := (i == 0)
        filename := fmt.Sprintf("ad%d_%d%s", adsID, time.Now().UnixNano(), filepath.Ext(fileHeader.Filename))

        // Заливаем в MinIO (bucket = ads-photos)
        if err := h.minioRepository.UploadFile(data, filename, 1); err != nil {
            zap.L().Error("minio upload failed", zap.Error(err))
            continue
        }
        // Сохраняем запись в таблицу ads_photos
        if err := h.contentRepository.SaveNewPhoto(ctx, adsID, filename, isMain); err != nil {
            zap.L().Error("saving photo record failed", zap.Error(err))
            continue
        }
        zap.L().Info("photo saved", zap.String("filename", filename))
    }

    // 8) Успешный ответ
    c.JSON(http.StatusCreated, gin.H{
        "id":              adsID,
        "photos_uploaded": true,
    })
}

func (h *Handler) ListAds(c *gin.Context) {
    ctx := c.Request.Context()

    // 1) Считываем все query-параметры
    adsType   := c.Query("ads_type")             // "1" или "2"
    city      := c.Query("city")
    district  := c.Query("district")
    complex   := c.Query("complex")
    rooms     := c.QueryArray("rooms")
	minPrice := c.Query("minPrice")
	maxPrice := c.Query("maxPrice")       
    minArea   := c.Query("minArea")
    maxArea   := c.Query("maxArea")
    minYear   := c.Query("minYear")
    maxYear   := c.Query("maxYear")
    minFloor  := c.Query("minFloor")
    maxFloor  := c.Query("maxFloor")
    minCeil   := c.Query("minCeil")
    maxCeil   := c.Query("maxCeil")
    pledge    := c.Query("pledge")               // "true" / "false" / ""

    // 2) Вызываем репозиторий
    ads, err := h.contentRepository.ListAds(
        ctx,
        adsType,
        city,
        district,
        complex,
        rooms,
		minPrice, maxPrice,
        minArea, maxArea,
        minYear, maxYear,
        minFloor, maxFloor,
        minCeil, maxCeil,
        pledge,
    )
    if err != nil {
        zap.L().Error("ListAds failed", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list ads"})
        return
    }

    // 3) Отдаём результат
    c.JSON(http.StatusOK, ads)
}


func (h *Handler) GetMyAds(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)

	content, err := h.contentRepository.GetMyAds(ctx, userId)
	if err != nil {
		zap.L().Error("get all ads failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    		"error": "internal server error",
		})
		return
	}
	c.JSON(http.StatusOK, content)

}

func (h *Handler) GetByIdAds(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		zap.L().Error("get id failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    		"error": "internal server error",
		})
	}

	content, err := h.contentRepository.GetByIdAds(ctx, id)
	if err != nil {
		zap.L().Error("get all ads failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    	"error": "internal server error",
			})
		return
	}
	content.DescriptionAppartment, err = h.contentRepository.GetDescOfAppart(ctx, content.NameAppartment)
	if err != nil {
		zap.L().Error("get all ads failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    	"error": "internal server error",
			})
		return
	}
	c.JSON(http.StatusOK, content)
}

func (h *Handler) GetByIdMyAds(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		zap.L().Error("get id failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    	"error": "internal server error",
			})
	}

	content, err := h.contentRepository.GetByIdMyAds(ctx, id, userId)
	if err != nil {
		zap.L().Error("get by id ads failed", zap.Error(err))
	}
	if err != nil {
		zap.L().Error("get by id ads failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    	"error": "internal server error",
		})
		return
	}
	c.JSON(http.StatusOK, content)
}

func (h *Handler) UpdateByIdAds(c *gin.Context) {
    ctx := c.Request.Context()

    // 1) Получаем userId из контекста (AuthMiddleware)
    userId := c.GetInt(common.KeySet)

    // 2) Достаём id объявления из URL
    idParam := c.Param("id")
    id, err := strconv.Atoi(idParam)
    if err != nil {
        zap.L().Error("get id failed", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ad id"})
        return
    }

    // 3) Биндим форму в models.Content
    var content models.Content
    if err := c.ShouldBind(&content); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form data"})
        return
    }

    // 4) Валидация (pledge/bank_id и остальное)
    if err := content.ChekingCorrectness(); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 5) Выполняем UPDATE через репозиторий
    if err := h.contentRepository.UpdateByIdAds(ctx, id, userId, content); err != nil {
        zap.L().Error("update content failed", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update ad"})
        return
    }

    // 6) Удаление фото, если были переданы delete_ids[]
    if len(content.DeletePhotoIDs) > 0 {
        var idsToDelete []int
        for _, s := range content.DeletePhotoIDs {
            idInt, err := strconv.Atoi(s)
            if err == nil {
                idsToDelete = append(idsToDelete, idInt)
            }
        }
        if len(idsToDelete) > 0 {
            if err := h.contentRepository.DeleteByIdPhoto(ctx, idsToDelete, id); err != nil {
                zap.L().Error("delete photos failed", zap.Error(err))
                c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete photos"})
                return
            }
        }
    }

    // 7) Добавление новых фото (если пришли)
    form, err := c.MultipartForm()
    if err != nil || len(form.File["photos"]) == 0 {
        zap.L().Warn("photos were not uploaded")
        c.JSON(http.StatusOK, gin.H{
            "id":              id,
            "photos_uploaded": false,
        })
        return
    }

    for _, fileHeader := range form.File["photos"] {
        file, err := fileHeader.Open()
        if err != nil {
            zap.L().Error("error opening photo", zap.Error(err))
            continue
        }
        data, err := io.ReadAll(file)
        file.Close()
        if err != nil {
            zap.L().Error("error reading photo", zap.Error(err))
            continue
        }

        filename := fmt.Sprintf("ad%d_%d%s", id, time.Now().UnixNano(), filepath.Ext(fileHeader.Filename))

        if err := h.minioRepository.UploadFile(data, filename, 1); err != nil {
            zap.L().Error("minio upload failed", zap.Error(err))
            continue
        }
        if err := h.contentRepository.SaveNewPhoto(ctx, id, filename, false); err != nil {
            zap.L().Error("failed to save new photo", zap.Error(err))
            continue
        }
        zap.L().Info("save new photo", zap.String("filename", filename))
    }

    // 8) Обновляем информацию о «главном» фото (если нужна такая логика)
    if err := h.contentRepository.UpdateMainPhoto(ctx, id); err != nil {
        zap.L().Error("update main photo failed", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
        return
    }

    // 9) Успешный ответ
    c.Status(http.StatusOK)
}

func (h *Handler) DeleteByIdAds(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		zap.L().Error("get id failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    	"error": "internal server error",
		})
		return
	}

	if err := h.contentRepository.DeleteByIdAds(ctx, id, userId); err != nil {
		zap.L().Error("delete content by id failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
    "error": "internal server error",
		})
		return
	}
	c.Status(http.StatusOK)

}

// ListAppartments возвращает все ЖК из указанного района:
// GET /api/v1/content/appartments?district_id=42
func (h *Handler) ListAppartments(c *gin.Context) {
    ctx := c.Request.Context()

    // парсим district_id из query
    districtID, err := strconv.Atoi(c.Query("district_id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid district_id"})
        return
    }

    // получаем список ЖК
    list, err := h.contentRepository.ListByDistrict(ctx, districtID)
    if err != nil {
        zap.L().Error("failed to list apartments", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list apartments"})
        return
    }

    c.JSON(http.StatusOK, list)
}

// GET /api/v1/content/appartments/:id
func (h *Handler) GetAppartmentById(c *gin.Context) {
    ctx := c.Request.Context()
    rawID := c.Param("id")

    apt, err := h.contentRepository.GetByID(ctx, rawID)
    if err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        } else {
            zap.L().Error("failed to get apartment by id", zap.Error(err))
            c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch apartment"})
        }
        return
    }

    c.JSON(http.StatusOK, apt)
}

func (h *Handler) ListCities(c *gin.Context) {
  ctx := c.Request.Context()
  list, err := h.contentRepository.GetAllCities(ctx)
  if err != nil {
    zap.L().Error("failed to list cities", zap.Error(err))
    c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list cities"})
    return
  }
  c.JSON(http.StatusOK, list)
}

// ListDistricts — GET /api/v1/locations/districts?city_id=123
func (h *Handler) ListDistricts(c *gin.Context) {
  cityID, err := strconv.Atoi(c.Query("city_id"))
  if err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid city_id"})
    return
  }
  ctx := c.Request.Context()
  list, err := h.contentRepository.GetDistrictsByCity(ctx, cityID)
  if err != nil {
    zap.L().Error("failed to list districts", zap.Error(err))
    c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list districts"})
    return
  }
  c.JSON(http.StatusOK, list)
}


func (h *Handler) BuyApartment(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)
	apartmentId, _ := strconv.Atoi(c.Query("apartment_id"))
	sellerId, _ := strconv.Atoi(c.Query("seller_id"))
	sumStr := c.Query("sum")
	sum, _ := strconv.ParseFloat(sumStr, 64)

	if err := h.contentRepository.BuyApartment(ctx, userId, apartmentId, sellerId, sum); err != nil && !errors.Is(err, common.NotEnoughMoney) {
		zap.L().Error("buy apartment failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, c)
		return
	} else if errors.Is(err, common.NotEnoughMoney) {
		zap.L().Info("Not enough money", zap.Int("user_id", userId))
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "not enough money"})
		return
	}
	c.Status(http.StatusOK)
}

func (h *Handler) ConfirmationOfUser(c *gin.Context) {
	ctx := c.Request.Context()
	userId := c.GetInt(common.KeySet)

	content, err := h.contentRepository.GetConfirmationOfUser(ctx, userId)
	if err != nil {
		zap.L().Error("get confirmation of user failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, c)
		return
	}
	c.JSON(http.StatusOK, content)
}

func (h *Handler) ProofOfPurchase(c *gin.Context) {
	ctx := c.Request.Context()
	userId := c.GetInt(common.KeySet)
	status := c.Query("status")
	salesId, _ := strconv.Atoi(c.Param("sales_id"))
	sellerId, _ := strconv.Atoi(c.Param("seller_id"))
	sumStr := c.Query("sum")
	sum, _ := strconv.ParseFloat(sumStr, 64)

	//switch status {
	//case "true":
	if err := h.contentRepository.ProofOfPurchase(ctx, userId, status, salesId, sellerId, sum); err != nil {
		zap.L().Error("failed to proof of purchase", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, c)
		return
	}
	//case "false":

	//}
	c.Status(http.StatusOK)
}
