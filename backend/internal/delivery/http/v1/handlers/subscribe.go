package handlers

import (
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/paymentintent"
	// "github.com/stripe/stripe-go/v82/paymentmethod"
	"github.com/stripe/stripe-go/v82/webhook"
	"go.uber.org/zap"
	"io/ioutil"
	"net/http"
	"strconv"
)

// internal/delivery/http/v1/handlers/subscribe.go

func (h *Handler) TopUp(c *gin.Context) {
    // 1) Берём userId из контекста, куда его положил AuthMiddleware
    userId := c.GetInt(common.KeySet)
    if userId == 0 {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Нет сессии"})
        return
    }

    // 2) Парсим тело запроса ({"amount": 1234.0})
    var pay models.Pay
    if err := c.ShouldBind(&pay); err != nil || pay.Amount <= common.Zero {
        zap.L().Error("Failed to parse request", zap.Error(err))
        c.Status(http.StatusBadRequest)
        return
    }

    // 3) Устанавливаем секретный ключ Stripe (server‐side)
    stripe.Key = h.stripeSecretKey

    // 4) Создаём PaymentIntent без Confirm и без явного PaymentMethod
    intent, err := paymentintent.New(&stripe.PaymentIntentParams{
        Amount:   stripe.Int64(int64(pay.Amount) * 100), // сумма в копейках (KZT)
        Currency: stripe.String("KZT"),
        // Включаем автоматическое определение метода оплаты:
        AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
            Enabled: stripe.Bool(true),
        },
        Metadata: map[string]string{
            "user_id": strconv.Itoa(userId), // будем читать это в вебхуке
        },
    })
    if err != nil {
        zap.L().Error("Failed to create PaymentIntent", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 5) Возвращаем на фронт только client_secret
    c.JSON(http.StatusOK, gin.H{
        "client_secret": intent.ClientSecret,
    })
}


 func (h *Handler) HandleWebhook(c *gin.Context) {
     ctx := c.Request.Context()

     const MaxBodyBytes = int64(65536)
     c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

     payload, err := ioutil.ReadAll(c.Request.Body)
     if err != nil {
         zap.L().Error("Failed to read request", zap.Error(err))
         c.JSON(http.StatusServiceUnavailable, gin.H{"error": "read error"})
         return
     }

     event, err := webhook.ConstructEvent(payload, c.Request.Header.Get("Stripe-Signature"), h.stripeWebhookKey)
     if err != nil {
         c.JSON(http.StatusBadRequest, gin.H{"error": "signature error"})
         return
     }

     if event.Type == "payment_intent.succeeded" {
         var intent stripe.PaymentIntent
         if err := json.Unmarshal(event.Data.Raw, &intent); err != nil {
             c.JSON(http.StatusBadRequest, gin.H{"error": "unmarshal error"})
             return
         }

         userIDStr := intent.Metadata["user_id"]
         amount := float64(intent.Amount) / 100.0

         userID, err := strconv.Atoi(userIDStr)
         if err != nil {
             c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
             return
         }

         // Записываем в БД
         if err := h.contentRepository.AddingBalance(ctx, userID, amount); err != nil {
             zap.L().Error("failed to update balance:", zap.Error(err))
             c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update balance"})
             return
         }
         zap.L().Info("Balance updated successfully", zap.Int("userID", userID), zap.Float64("amount", amount))
     }

     c.JSON(http.StatusOK, gin.H{"status": "received"})
 }



func (h *Handler) SubscribeStatus(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetInt("user_id")

	if !h.contentRepository.CheckSubscribe(ctx, userId) {
		zap.L().Info("Subscibe not found", zap.Int("user_id", userId))
		c.JSON(http.StatusNotFound, gin.H{"error": "subscibe not found"})
		return
	}
	c.Status(http.StatusOK)
}

func (h *Handler) BuySubscribe(c *gin.Context) {
    ctx := c.Request.Context()
    userId := c.GetInt(common.KeySet)
    idSub := c.Param("id")

    // 1) Пробуем списать деньги и активировать подписку
    if err := h.contentRepository.BuySubscribe(ctx, userId, idSub); err != nil {
        if errors.Is(err, common.NotEnoughMoney) {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient funds"})
            return
        }
        zap.L().Error("Failed to buy subscribe", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
        return
    }

    // 2) Если всё успешно, достаём из БД обновлённого пользователя
    user, err := h.majorRepository.GetUserByID(ctx, userId)
    if err != nil {
        zap.L().Error("failed to fetch user after subscribe", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user"})
        return
    }

    // 3) В **теле ответа** отправляем JSON со всей нужной инфой (balance, isSubscribed, и т.д.)
    c.JSON(http.StatusOK, gin.H{
        "id":           user.ID,
        "name":         user.Name,
        "email":        user.Login,
        "balance":      user.Balance,
        "isSubscribed": user.Subscribe,
        // можно добавить остальные публичные поля
    })
}
