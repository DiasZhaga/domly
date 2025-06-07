package server

import (
	"diplom/internal/config"
	"diplom/internal/delivery/http"
	"diplom/internal/delivery/http/v1/handlers"
	"github.com/gin-contrib/cors"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"time"
)

type Navigator struct {
	cfg    *config.Config
	Engine *gin.Engine
}


func NewNavigator(cfg *config.Config) *Navigator {
	gin.SetMode(cfg.App.Mode)

	Engine := gin.New()
	Engine.Use(
		ginzap.GinzapWithConfig(
			zap.L(),
			&ginzap.Config{
				TimeFormat: time.RFC1123Z,
				UTC:        true,
				SkipPaths:  []string{"/healthz"},
			},
		),
	)
	Engine.Use(ginzap.RecoveryWithZap(zap.L(), true))
   
	Engine.Use(
		cors.New(cors.Config{
			AllowOrigins: []string{"http://localhost:3000"},
			AllowMethods: cfg.Cors.AllowMethods,
			AllowHeaders: cfg.Cors.AllowHeaders,
			AllowCredentials: true,
		}),
	)

	return &Navigator{
		cfg:    cfg,
		Engine: Engine,
	}
}

func (n *Navigator) RegisterRoutes(commonHandler *http.CommonHandler, majorHandler *handlers.Handler) {
	n.Engine.GET("healthz", commonHandler.HealthCheck)

	api := n.Engine.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			auth := v1.Group("/auth")
			{
				auth.POST("/register", majorHandler.Register)
				auth.POST("/login", majorHandler.Login)
				//auth.GET("/set-new-password/:login", majorHandler.SetNewPassword)
				auth.Use(majorHandler.AuthMiddleware)
				auth.GET("/me", majorHandler.Me)
				auth.GET("/logout", majorHandler.Logout)
				//auth.GET() personal account
			}
			content := v1.Group("/content")
			{
				content.GET("/ads", majorHandler.ListAds)               //+
				content.GET("/ads/:id", majorHandler.GetByIdAds)          //+
				content.Use(majorHandler.AuthMiddleware)
				content.POST("/ads", majorHandler.SubmitAnAds)            //+
				content.GET("/ads/my", majorHandler.GetMyAds)             //+
				content.PUT("/ads/my/:id", majorHandler.UpdateByIdAds)    //+
				content.DELETE("/ads/my/:id", majorHandler.DeleteByIdAds) //+
				content.GET("/appartments", majorHandler.ListAppartments)
      			content.GET("/appartments/:id", majorHandler.GetAppartmentById)
				content.GET("/ads/buy", majorHandler.BuyApartment)
				content.GET("/ads/confirmation", majorHandler.ConfirmationOfUser)
				content.GET("/ads/buy/confirmation/:sales_id", majorHandler.ProofOfPurchase)
				content.GET("/ads/seller-history", majorHandler.GetSalesOfUser)
				content.GET("/banks", majorHandler.ListBanks)
			}
			talk := v1.Group("/talk")
			{
				talk.GET("/stats", majorHandler.MessageStats)
				talk.GET("/ws", majorHandler.WebSocketHandler)
				talk.Use(majorHandler.AuthMiddleware)
				talk.GET("/dialogs", majorHandler.GetDialogs)
				talk.GET("/messages/history", majorHandler.GetHistory)
				talk.GET("/messages/search", majorHandler.SearchMessages)
			}
			locations := v1.Group("/locations")
			{
				locations.GET("/cities", majorHandler.ListCities)
				locations.GET("/districts", majorHandler.ListDistricts)
			}
			pledge := v1.Group("/pledge")
			{
				pledge.Use(majorHandler.AuthMiddleware)
				pledge.GET("/ads", majorHandler.GetPledgeAds)
			}
			developers := v1.Group("/developers")
			{
				developers.Use(majorHandler.AuthMiddleware)
				developers.GET("", majorHandler.GetDevelopers)
				developers.POST("/message/:id", majorHandler.SendDeveloperMessage)
			}
			subscribe := v1.Group("/subscribe")
			{
				subscribe.Use(majorHandler.AuthMiddleware)
				subscribe.GET("/", majorHandler.SubscribeStatus)
				subscribe.GET("/buy/:id", majorHandler.BuySubscribe)
			}
			comments := v1.Group("/comments")
			{
				comments.Use(majorHandler.AuthMiddleware)
				comments.POST("/:id", majorHandler.AddComment)
				comments.DELETE("/:id", majorHandler.DelComment)
			}
			payments := v1.Group("/payments")
            {
                // 1) Сразу регистрируем endpoint для Stripe-вебхуков:
                payments.POST("/handle-webhook", majorHandler.HandleWebhook)
                // 2) Далее — всё, что требует залогиненного юзера:
                payments.Use(majorHandler.AuthMiddleware)
                payments.POST("/topup", majorHandler.TopUp)
            }
		}
	}
}
