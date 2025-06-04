package cache

import (
	"bytes"
	"context"
	"diplom/internal/config"
	"io"
	"mime"
	"path/filepath"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

type MinioRepository struct {
	Client  *minio.Client
	Bucket  string
	BaseURL string
}

// NewMinioRepository инициализирует клиент MinIO по конфигу и возвращает репозиторий
func NewMinioRepository(cfg *config.MinioConf) *MinioRepository {
	// для локального MinIO обычно Secure=false
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: false,
	})
	if err != nil {
		panic(err)
	}
	zap.L().Info("Successfully initialized minio client")

	return &MinioRepository{
		Client:  client,
		Bucket:  cfg.Bucket,
		BaseURL: cfg.Endpoint,
	}
}

// UploadFile загружает data в MinIO под именем objectName.
// Третий аргумент (_ int) можно игнорировать.
func (m *MinioRepository) UploadFile(data []byte, objectName string, _ int) error {
	// выясняем content-type по расширению
	ext := filepath.Ext(objectName)             // например ".png"
	contentType := mime.TypeByExtension(ext)    // например "image/png"
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	reader := bytes.NewReader(data)
	_, err := m.Client.PutObject(
		context.Background(),
		m.Bucket,
		objectName,
		reader,
		int64(len(data)),
		minio.PutObjectOptions{
			ContentType: contentType,
		},
	)
	return err
}

// GetObject позволяет читать объект из MinIO по его имени
func (m *MinioRepository) GetObject(objectName string) (io.ReadCloser, error) {
	return m.Client.GetObject(
		context.Background(),
		m.Bucket,
		objectName,
		minio.GetObjectOptions{},
	)
}
