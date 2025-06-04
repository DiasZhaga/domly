# 

1) config\conf.json - в этом файле лежит env для портов, БД и надо будет еще MinIO подрубить.
2) https://min.io/docs/minio/windows/index.html - здесь о том как подрубить MinIO
3) docker compose up - поднять контейнер postgres and minio
4) go run cmd/main.go - команда для запуска бэкэнда (порт 8080)