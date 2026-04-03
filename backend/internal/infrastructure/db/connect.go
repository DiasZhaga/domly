package db

import (
	"database/sql"
	"diplom/internal/config"
	"fmt"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"go.uber.org/zap"
)

func NewConnect(cfg *config.DbConf) (*sql.DB, error) {
	dbSql := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s password=%s sslmode=disable",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Name,
		cfg.Pass,
	)
	db, err := sql.Open("postgres", dbSql)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	zap.L().Info("Successfully initialized database")
	return db, nil
}
