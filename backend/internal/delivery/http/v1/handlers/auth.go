package handlers

import (
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (h *Handler) Register(c *gin.Context) {
	ctx := c.Request.Context()

	login := c.Request.FormValue("login")
	password := c.Request.FormValue("password")
	name := c.Request.FormValue("name")

	response := models.RegisterResponse{}

	// проверка на пустые символы
	if login == "" || password == "" {
		zap.L().Error("user data is empty")
		response.ErrorEmpty()
		c.AbortWithStatusJSON(http.StatusBadRequest, response)
		return
	}
	// проверка на англ
	if !common.ConfirmationLatinOnly(login) && !common.ConfirmationLatinOnly(password) {
		zap.L().Error("data is not in Latin")
		response.ErrorLatin()
		c.AbortWithStatusJSON(http.StatusBadRequest, response)
		return
	}
	// проверка длины пароля
	if len(password) < common.MinLenPassword {
		zap.L().Error("password is short")
		response.ErrorLen()
		c.AbortWithStatusJSON(http.StatusBadRequest, response)
		return
	}
	// проверка на совпадение логина и пароля
	if login == password {
		zap.L().Error("login or password is match")
		response.ErrorMatch()
		c.AbortWithStatusJSON(http.StatusConflict, response)
		return
	}

	typeLogin := common.SetTypeLogin(login)
	switch typeLogin {
	case common.TypeEmail:
		if !common.СonfirmationEmail(login) {
			zap.L().Error("login type Email is invalid")
			response.ErrLogin(typeLogin)
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		}
	case common.TypePhone:
		if !common.ConfirmationPhone(login) {
			zap.L().Error("login type Phone is invalid")
			response.ErrLogin(typeLogin)
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		}
	}
	correct, err := h.majorRepository.MatchСheckLogin(ctx, login)
	if err != nil || correct {
		zap.L().Error("this login already exists in the database of registered users")
		response.ErrorMatchLogin()
		c.AbortWithStatusJSON(http.StatusConflict, response)
		return
	}
	if err = h.majorRepository.RegisterNewUser(ctx, login, password, name); err != nil {
		zap.L().Error("register new user failed", zap.Error(err))
		response.Error()
		c.AbortWithStatusJSON(http.StatusInternalServerError, response)
		return
	}
	response.Successfully()
	c.JSON(http.StatusOK, response)
}

func (h *Handler) Login(c *gin.Context) {
	ctx := c.Request.Context()

	login := c.Request.FormValue("login")
	password := c.Request.FormValue("password")

	if login == "" || password == "" {
		zap.L().Error("user login data is empty")
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Логин или пароль не указаны. Пожалуйста, убедитесь, что вы отправляете запрос как form-data (не raw JSON)."})
		return
	}

	// 1) Получаем id и сохранённый пароль
	id, savedPass, err := h.majorRepository.GetPassInDb(ctx, login)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			zap.L().Warn("user not found", zap.String("login", login))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный логин или пароль"})
			return
		}
		zap.L().Error("get user data failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{})
		return
	}
	if savedPass != password {
		zap.L().Error("password is invalid")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный логин или пароль"})
		return
	}

	// 2) Генерируем и сохраняем токен + куку
	sessionToken := uuid.New().String()
	if err = h.majorRepository.SaveCookieToken(ctx, id, sessionToken); err != nil {
		zap.L().Error("save cookie token failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{})
		return
	}
	c.SetCookie(
		"session_token",
		sessionToken,
		common.TimeSession,
		"/",
		"",
		false,
		true,
	)

	// 3) Достаём из БД полную модель пользователя
	userModel, err := h.majorRepository.GetUserByID(ctx, id)
	if err != nil {
		zap.L().Error("get user by id failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{})
		return
	}

	// 4) Отдаём имя клиенту
	c.JSON(http.StatusOK, gin.H{
		"name": userModel.Name,
	})
}

func (h *Handler) Logout(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)
	if err := h.majorRepository.DeleteCookie(ctx, userId); err != nil {
		zap.L().Error("delete cookie failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{})
		return
	}

	c.SetCookie(
		"session_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)
	c.Status(http.StatusOK)
}

func (h *Handler) AuthMiddleware(c *gin.Context) {
	ctx := c.Request.Context()

	token, err := c.Cookie("session_token")
	if err != nil || token == "" {
		zap.L().Error("session token is empty")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Нет сессии"})
		return
	}

	userId, createdAt, err := h.majorRepository.CheckingLiveCookie(ctx, token)
	if err != nil {
		zap.L().Error("check live cookie failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "<UNK> <UNK>"})
		return
	}

	if time.Since(createdAt) > common.StandartCookie {
		if err = h.majorRepository.DeleteCookie(ctx, userId); err != nil {
			zap.L().Error("delete cookie failed", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "<UNK> <UNK>"})
			return
		}
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Сессия истекла"})
		return
	}
	// Передаём user_id в обработчик
	c.Set(common.KeySet, userId)
	c.Next()
}

func (h *Handler) Me(c *gin.Context) {
	ctx := c.Request.Context()

	// AuthMiddleware кладёт user_id в c.Set(common.KeySet, <int>)
	// Поэтому здесь достаём его:
	userID := c.GetInt(common.KeySet)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authorized"})
		return
	}

	// Вызываем именно MajorRepository.GetUserByID:
	user, err := h.majorRepository.GetUserByID(ctx, userID)
	if err != nil {
		zap.L().Error("failed to fetch user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
		return
	}

	// Возвращаем JSON с публичными полями:
	c.JSON(http.StatusOK, gin.H{
		"id":           user.ID,
		"name":         user.Name,
		"email":        user.Login, // если login хранит email/телефон
		"balance":      user.Balance,
		"isSubscribed": user.Subscribe,
		"createdAt":    user.CreatedAt, // при желании
		// "stopedAt": user.StopedAt,      // если захотите вернуть
	})
}
