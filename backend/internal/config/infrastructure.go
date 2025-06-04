package config

type DbConf struct {
	Host string `json:"host"`
	Port string `json:"port"`
	User string `json:"user"`
	Pass string `json:"pass"`
	Name string `json:"name"`
}

type MinioConf struct {
	Endpoint  string `json:"endpoint"`
	AccessKey string `json:"username"`
	SecretKey string `json:"password"`
	Bucket    string `json:"bucket"`
}
