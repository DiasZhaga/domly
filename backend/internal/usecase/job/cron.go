package job

import (
	"diplom/internal/domain/interfaces"
	"go.uber.org/zap"
	"time"
)

type UploadJob struct {
	contentRepository interfaces.ContentRepositoryI
}

func NewUploadJob(contentRepository interfaces.ContentRepositoryI) *UploadJob {
	return &UploadJob{
		contentRepository: contentRepository,
	}
}

func (j *UploadJob) Run() {

	content, err := j.contentRepository.UpdAllAds()
	if err != nil {
		zap.L().Error("get all ads update failed", zap.Error(err))
		return
	}

	for _, v := range content {
		if time.Now().After(v.StopedAt) {
			if err := j.contentRepository.DeactiveAds(v.Id); err != nil {
				zap.L().Error("deactivate ads failed", zap.Error(err))
				continue
			}
		}
	}
}
