package main

import (
	"context"
	"diplom/internal/app"
	"diplom/internal/config"
	"diplom/internal/domain/models"
	"fmt"
	"go.uber.org/zap"
	"log"
	"os"
	"os/signal"
	"syscall"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	cfg := config.GetConfig()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	application := app.NewApp(cfg)
	if err := application.Init(); err != nil {
		panic(fmt.Sprintf("Failed to start application %v", zap.Error(err)))
	}
	defer func() {
		if r := recover(); r != nil {
			report := models.GetPanicReport(2, r)
			log.Printf("[MAIN PANIC] %v", report)
			os.Exit(1)
		}
	}()
	application.Run(ctx)

}
