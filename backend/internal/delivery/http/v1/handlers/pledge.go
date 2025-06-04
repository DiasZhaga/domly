package handlers

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
)

func (h *Handler) GetPledgeAds(c *gin.Context) {
	ctx := c.Request.Context()

	content, err := h.contentRepository.GetPledgeAds(ctx)
	if err != nil {
		zap.L().Error("get all ads failed", zap.Error(err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, c)
		return
	}
	c.JSON(http.StatusOK, content)

}
