package handlers

import (
	"diplom/internal/common"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"net/http"
	"strconv"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var (
	connections = make(map[int]*websocket.Conn) // userID → соединение
	onlineUsers = make(map[int]bool)
)

func (h *Handler) WebSocketHandler(c *gin.Context) {
	ctx := c.Request.Context()
	userID, _ := strconv.Atoi(c.Query(common.KeySet))

	if userID == 0 {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		zap.L().Error("websocket upgrade error", zap.Error(err))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	connections[userID] = conn
	onlineUsers[userID] = true

	for uid, otherConn := range connections {
		if uid != userID {
			_ = otherConn.WriteJSON(gin.H{
				"type":    "online",
				"user_id": userID,
			})
		}
	}

	defer func() {
		conn.Close()
		delete(connections, userID)
		delete(onlineUsers, userID)

		// Уведомить других, что userID оффлайн
		for uid, otherConn := range connections {
			if uid != userID {
				_ = otherConn.WriteJSON(gin.H{
					"type":    "offline",
					"user_id": userID,
				})
			}
		}
	}()

	for {
		var msg struct {
			To      int    `json:"to"`
			Content string `json:"content"`
		}
		if err := conn.ReadJSON(&msg); err != nil {
			zap.L().Warn("client disconnected", zap.Error(err))
			break
		}

		// Сохраняем в БД
		if err := h.contentRepository.SaveMess(ctx, msg.To, msg.Content, userID); err != nil {
			zap.L().Error("ошибка сохранения сообщения", zap.Error(err))
			continue
		}

		// Отправить себе
		_ = conn.WriteJSON(gin.H{
			"type":    common.TypeMessage,
			"from":    userID,
			"to":      msg.To,
			"content": msg.Content,
		})

		// Отправить получателю, если онлайн
		if receiverConn, ok := connections[msg.To]; ok {
			_ = receiverConn.WriteJSON(gin.H{
				"type":    common.TypeMessage,
				"from":    userID,
				"content": msg.Content,
			})
		}
	}
}

func (h *Handler) MessageStats(c *gin.Context) {
	ctx := c.Request.Context()

	stats := h.contentRepository.GetStats(ctx)
	c.JSON(http.StatusOK, stats)
}

func (h *Handler) GetHistory(c *gin.Context) {
	ctx := c.Request.Context()

	user1 := c.GetInt(common.KeySet)
	user2, _ := strconv.Atoi(c.Query(common.KeyTwoSet))

	page, _ := strconv.Atoi(c.DefaultQuery(common.KeyPage, common.DefaultPage))
	limit, _ := strconv.Atoi(c.DefaultQuery(common.KeyLimit, common.LimitPage))

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	msgs := h.contentRepository.GetHistory(ctx, user1, user2, limit, offset)
	c.JSON(http.StatusOK, msgs)
}

func (h *Handler) GetDialogs(c *gin.Context) {
	ctx := c.Request.Context()

	userID := c.GetInt(common.KeySet)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	dialogs := h.contentRepository.GetDialogs(ctx, userID)
	c.JSON(http.StatusOK, dialogs)
}

func (h *Handler) SearchMessages(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt(common.KeySet)
	user2 := c.Query(common.KeyTwoSet)
	text := c.Query(common.KeyText)
	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'q' is required"})
		return
	}

	results := h.contentRepository.SearchMessages(ctx, text, userId, user2)
	c.JSON(http.StatusOK, results)
}
