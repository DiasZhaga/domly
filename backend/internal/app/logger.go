package app

import (
	"go.uber.org/zap"
	"strings"
)

func InitLogger(stage string) error {
	var (
		logger *zap.Logger
		err    error
	)

	if strings.EqualFold(stage, "production") {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}

	if err != nil {
		return err
	}

	zap.ReplaceGlobals(logger)
	zap.RedirectStdLog(logger)

	zap.L().Info("Successfully initialized logger")
	return nil
}
