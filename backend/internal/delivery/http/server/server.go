package server

import (
	"context"
	"diplom/internal/config"
	"diplom/internal/domain/interfaces"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type nexus struct {
	cfg    *config.Config
	server *http.Server
}

func NewNexus(cfg *config.Config, engine *gin.Engine) interfaces.NexusI {
	return &nexus{
		cfg: cfg,
		server: &http.Server{
			Addr:           fmt.Sprintf(":%d", cfg.App.Port),
			Handler:        engine,
			MaxHeaderBytes: 1 << 20,
			ReadTimeout:    cfg.App.RTO * time.Second,
			WriteTimeout:   cfg.App.WTO * time.Second,
		},
	}
}

func (n *nexus) Start() error {
	err := n.server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}

	return err
}

func (n *nexus) Stop() error {
	ctxWithTimeout, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	return n.server.Shutdown(ctxWithTimeout)
}
