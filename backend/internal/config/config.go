package config

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
)

var (
	once sync.Once
	Conf = &Config{}
)

type Config struct {
	App                 *AppConf   `json:"APP"`
	Cors                *CorsConf  `json:"CORS"`
	Db                  *DbConf    `json:"DB"`
	Minio               *MinioConf `json:"MINIO"`
	StripeSecretKey     string     `json:"STRIPE_SECRET_KEY"`     // sk_test_…
	StripeWebhookSecret string     `json:"STRIPE_WEBHOOK_SECRET"` // whsec_…
}

func GetConfig() *Config {
	once.Do(
		func() {
			Conf = new(Config)
			LoadLocalConf(Conf)
		},
	)
	return Conf
}

func LoadLocalConf(cfg interface{}) {
	path := os.Getenv("CONFIG_PATH")
	if path == "" {
		path = "./config/conf.json"
	}
	LoadConfig(path, cfg)
}

func LoadConfig(path string, cfg interface{}) {
	file, err := os.Open(path)
	if err != nil {
		panic(fmt.Sprintf("[LoadConfig]: Error| %s", err.Error()))
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(cfg); err != nil {
		panic(fmt.Sprintf("[LoadConfig]: Error| %s", err.Error()))
	}
}
