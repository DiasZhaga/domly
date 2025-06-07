package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *Handler) AddComment(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt("user_id")
	appartId, _ := strconv.Atoi(c.Param("id"))
	var req struct {
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.contentRepository.AddComment(ctx, userId, appartId, req.Comment); err != nil {
		zap.L().Error("Adding comment failed", zap.Error(err))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusOK)
}

func (h *Handler) GetAllCommentByAppart(c *gin.Context) {
	ctx := c.Request.Context()

	appartId, _ := strconv.Atoi(c.Param("id"))
	comments, err := h.contentRepository.GetAllComment(ctx, appartId)
	if err != nil {
		zap.L().Error("Getting all comment failed", zap.Error(err))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *Handler) DelComment(c *gin.Context) {
	ctx := c.Request.Context()
	userId := c.GetInt("user_id")

	commId, _ := strconv.Atoi(c.Param("id"))

	if err := h.contentRepository.DelComment(ctx, userId, commId); err != nil {
		zap.L().Error("Adding comment failed", zap.Error(err))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusOK)
}
