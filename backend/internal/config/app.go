package config

import "time"

type AppConf struct {
	Mode  string        `json:"APP_MODE"`
	Code  string        `json:"APP_CODE"`
	Port  int           `json:"APP_PORT"`
	Stage string        `json:"APP_STAGE"`
	RTO   time.Duration `json:"APP_RTO"`
	WTO   time.Duration `json:"APP_WTO"`
}
