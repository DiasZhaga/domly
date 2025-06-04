package config

type CorsConf struct {
	AllowOrigins []string `json:"ALLOW_ORIGINS"`
	AllowMethods []string `json:"ALLOW_METHODS"`
	AllowHeaders []string `json:"ALLOW_HEADERS"`
}
