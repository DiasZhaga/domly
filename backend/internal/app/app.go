package app

import (
	"context"
	"database/sql"
	"diplom/internal/config"
	"diplom/internal/delivery/http"
	"diplom/internal/delivery/http/server"
	"diplom/internal/delivery/http/v1/handlers"
	"diplom/internal/domain/interfaces"
	"diplom/internal/infrastructure/cache"
	repoDb "diplom/internal/infrastructure/db"
	"diplom/internal/infrastructure/db/repository"
	"diplom/internal/usecase/job"
	"github.com/go-co-op/gocron/v2"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
)

type App struct {
	cfg       *config.Config
	scheduler gocron.Scheduler // Планировщик задач
	nexus     interfaces.NexusI
	db        *sql.DB
}

func NewApp(cfg *config.Config) *App {
	return &App{
		cfg: cfg,
	}
}

func (a *App) Init() error {
	var err error
	if err = InitLogger(a.cfg.App.Stage); err != nil {
		zap.L().Error("InitLogger failed", zap.Error(err))
		panic(err)
	}
	a.db, err = repoDb.NewConnect(a.cfg.Db)
	if err != nil {
		zap.L().Error("NewConnect failed", zap.Error(err))
		panic(err)
	}

	photoMinioRepo := cache.NewPhotoMinioRepository(a.cfg.Minio)
    docMinioRepo := cache.NewDocMinioRepository(a.cfg.Minio)

	majorRepository := repository.NewMajorRepository(a.db)
	contentRepository := repository.NewContentRepository(a.db)

	// Инициализация задачи для загрузки
	uploadJob := job.NewUploadJob(
		contentRepository,
	)

	//// Инициализация планировщика задач
	a.scheduler, err = InitScheduler(uploadJob)
	if err != nil {
		return err
	}

	commonHandler := http.NewCommonHandler(a.db)

	majorHandler := handlers.NewHandler(
        a.cfg.StripeSecretKey,     // sk_test_…
        a.cfg.StripeWebhookSecret, // whsec_…
        majorRepository,
        contentRepository,
        photoMinioRepo,
        docMinioRepo,
    )

	navigator := server.NewNavigator(a.cfg)
	navigator.RegisterRoutes(commonHandler, majorHandler)

	a.nexus = server.NewNexus(a.cfg, navigator.Engine)
	return nil
}

func (a *App) Run(ctx context.Context) {
	defer a.onShutdown()

	a.scheduler.Start()

	g, gCtx := errgroup.WithContext(ctx)

	g.Go(func() error {
		return a.nexus.Start()
	})

	<-gCtx.Done()

	if err := g.Wait(); err != nil {
		zap.L().Error("Service shutdown error", zap.Error(err))
	}

	_ = zap.L().Sync()
}

func (a *App) onShutdown() {
	a.closeConnection()
}

// closeConnections закрывает все открытые подключения.
func (a *App) closeConnection() {
	connectionPool := []interface{}{
		a.db,
	}

	for _, pool := range connectionPool {
		if pool == nil {
			continue
		}
		switch v := pool.(type) {
		case interfaces.CloserI:
			if err := v.Close(); err != nil {
				zap.L().Error("Failed to close connection", zap.Error(err))
			}
		}
	}
}
