package handlers

import (
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
	"strconv"
)

func (h *Handler) GetDevelopers(c *gin.Context) {
	ctx := c.Request.Context()

	devs, err := h.contentRepository.GetAllDevelopers(ctx)
	if err != nil {
		zap.L().Error("error getting developers", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, devs)
}

func (h *Handler) SendDeveloperMessage(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)
	devId, _ := strconv.Atoi(c.Param("id"))

	var msg models.DeveloperMessage
	if err := c.ShouldBind(&msg); err != nil {
		zap.L().Error("error parsing body", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "неверные данные"})
		return
	}

	if err := h.contentRepository.SaveDeveloperMessage(ctx, devId, userId, msg); err != nil {
		zap.L().Error("error saving developer message", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "не удалось сохранить сообщение"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "сообщение отправлено"})
}
