package common

import (
	"regexp"
	"strings"
)

func SetTypeLogin(login string) string {
	if strings.Contains(login, "@") && strings.Contains(login, ".") {
		return TypeEmail
	} else {
		return TypePhone
	}
}

func СonfirmationEmail(login string) bool {
	validSuffixes := []string{
		"@gmail.com", "@mail.ru", "@ya.ru", "@bk.ru", "@outlook.com",
	}

	// Проверяем наличие @ и что имя до @ не пустое
	atIndex := strings.Index(login, "@")
	if atIndex <= Zero {
		return false // либо нет @, либо ничего до него
	}

	for _, suffix := range validSuffixes {
		if strings.HasSuffix(login, suffix) {
			return true
		}
	}
	return false
}

func ConfirmationPhone(login string) bool {
	match, _ := regexp.MatchString(`^\d{11}$`, login)
	if !match {
		return false
	}

	// Список допустимых префиксов
	validPrefixes := []string{
		"7708", "7705", "7706", "7747", "7777", "7701", "7702",
	}

	for _, prefix := range validPrefixes {
		if strings.HasPrefix(login, prefix) {
			return true
		}
	}
	return false
}

func ConfirmationLatinOnly(data string) bool {
	match, _ := regexp.MatchString(`^[a-zA-Z0-9@._\-!#$%^&*()]+$`, data)
	return match
}

func FilterNonEmpty(items []string) []string {
	var result []string
	for _, item := range items {
		item = strings.TrimSpace(item)
		if item != "" {
			result = append(result, item)
		}
	}
	return result
}
