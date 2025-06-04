package repository

import (
	"context"
	"database/sql"
	"diplom/internal/common"
	"diplom/internal/domain/models"
	"go.uber.org/zap"
	"time"
)

type MajorRepository struct {
	db *sql.DB
}

func NewMajorRepository(db *sql.DB) *MajorRepository {
	return &MajorRepository{
		db: db,
	}
}

func (m *MajorRepository) MatchСheckLogin(ctx context.Context, login string) (bool, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var exists bool
	err := m.db.QueryRowContext(dbCtx, matchQuery, login).Scan(&exists)
	return exists, err
}

func (m *MajorRepository) RegisterNewUser(ctx context.Context, login, password, name string) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := m.db.ExecContext(dbCtx, registerQuery, login, password, name); err != nil {
		zap.L().Error("adding new user failed")
		return err
	}
	return nil
}

func (m *MajorRepository) GetPassInDb(ctx context.Context, login string) (int, string, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var id int
	var passInDb string
	if err := m.db.QueryRowContext(dbCtx, getPassQuery, login).Scan(&id, &passInDb); err != nil {
		zap.L().Error("get user data failed", zap.Error(err))
		return common.Zero, common.Empty, err
	}
	return id, passInDb, nil
}

func (m *MajorRepository) GetUserByID(ctx context.Context, id int) (models.User, error) {
    dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
    defer cancel()

    var u models.User
    // Теперь Scan в точности под порядок SELECT:
    row := m.db.QueryRowContext(dbCtx, getUserByIDQuery, id)
    if err := row.Scan(
        &u.ID,        // попадает из 1-го столбца (id)
		&u.Login,     // попадает из 2-го столбца (login)
		&u.Name,      // попадает из 3-го столбца (name)
		&u.Balance,   // попадает из 4-го столбца (balance)
		&u.Subscribe, // попадает из 5-го столбца (subscribe)
		&u.CreatedAt, // попадает из 6-го столбца (created_at)
    ); err != nil {
        zap.L().Error("get user by id failed", zap.Error(err))
        return models.User{}, err
    }
    return u, nil
}

func (m *MajorRepository) SaveCookieToken(ctx context.Context, id int, token string) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := m.db.ExecContext(dbCtx, saveTokenQuery, id, token, time.Now()); err != nil {
		zap.L().Error("saving cookie token failed")
		return err
	}
	return nil
}

func (m *MajorRepository) CheckingLiveCookie(ctx context.Context, token string) (int, time.Time, error) {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	var userId int
	var createdAt time.Time

	if err := m.db.QueryRowContext(dbCtx, checkingQuery, token).Scan(&userId, &createdAt); err != nil {
		zap.L().Error("checking live cookie failed")
		return common.Zero, time.Time{}, err
	}
	return userId, createdAt, nil
}

func (m *MajorRepository) DeleteCookie(ctx context.Context, id int) error {
	dbCtx, cancel := context.WithTimeout(ctx, common.TimeDbContext)
	defer cancel()

	if _, err := m.db.ExecContext(dbCtx, deleteCookieQuery, id); err != nil {
		zap.L().Error("deleting cookie failed")
		return err
	}
	return nil
}
