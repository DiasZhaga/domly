package repository

import (
	"context"
	"diplom/internal/common"
	"go.uber.org/zap"
)

func (c *ContentRepository) CheckSubscribe(ctx context.Context, userId int) bool {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var isSubscribed bool

	if err := c.db.QueryRowContext(dbCtx, checkSubQuery, userId).Scan(&isSubscribed); err != nil {
		zap.L().Error("failed check sub", zap.Error(err))
		return isSubscribed
	}
	return isSubscribed

}
