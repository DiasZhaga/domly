// backend/internal/infrastructure/cache/connect.go
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

// NewPhotoMinioRepository инициализирует клиент MinIO для бакета "ads-photos":
func NewPhotoMinioRepository(cfg *config.MinioConf) *MinioRepository {
    client, err := minio.New(cfg.Endpoint, &minio.Options{
        Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
        Secure: false, // локальный MinIO
    })
    if err != nil {
        panic(err)
    }
    zap.L().Info("Successfully initialized MinIO client for PHOTOS bucket", zap.String("bucket", cfg.BucketPhotos))

    return &MinioRepository{
        Client:  client,
        Bucket:  cfg.BucketPhotos,
        BaseURL: cfg.Endpoint,
    }
}

// NewDocMinioRepository инициализирует клиент MinIO для бакета "ads-documents":
func NewDocMinioRepository(cfg *config.MinioConf) *MinioRepository {
    client, err := minio.New(cfg.Endpoint, &minio.Options{
        Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
        Secure: false,
    })
    if err != nil {
        panic(err)
    }
    zap.L().Info("Successfully initialized MinIO client for DOCUMENTS bucket", zap.String("bucket", cfg.BucketDocuments))

    return &MinioRepository{
        Client:  client,
        Bucket:  cfg.BucketDocuments,
        BaseURL: cfg.Endpoint,
    }
}

// UploadFile загружает data в MinIO под именем objectName.
// Поле _ int остаётся, но мы его больше не используем.
func (m *MinioRepository) UploadFile(data []byte, objectName string, _ int) error {
    ext := filepath.Ext(objectName)          // e.g. ".pdf" или ".jpg"
    contentType := mime.TypeByExtension(ext) // e.g. "application/pdf" или "image/jpeg"
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
        minio.PutObjectOptions{ContentType: contentType},
    )
    return err
}

// GetObject позволяет читать объект из MinIO по имени objectName
func (m *MinioRepository) GetObject(objectName string) (io.ReadCloser, error) {
    return m.Client.GetObject(
        context.Background(),
        m.Bucket,
        objectName,
        minio.GetObjectOptions{},
    )
}
