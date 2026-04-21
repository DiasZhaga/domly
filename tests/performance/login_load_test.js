import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Design Load & Stress Tests (Конфигурация нагрузки)
export let options = {
    stages: [
        { duration: '10s', target: 50 },  // Ramp-up: разгон до 50 одновременных пользователей
        { duration: '20s', target: 50 },  // Normal load: держим 50 пользователей (обычный трафик)
        { duration: '10s', target: 200 }, // Spike load: резкий скачок трафика до 200 пользователей
        { duration: '20s', target: 200 }, // Peak load: держим пиковую нагрузку
        { duration: '10s', target: 0 },   // Ramp-down: плавно сводим на нет
    ],
    thresholds: {
        // Quality Gates: 95% запросов быстрее 500 мс, ошибок < 1%
        http_req_duration: ['p(95)<500'], 
        http_req_failed: ['rate<0.01'],   
    },
};

export default function () {
    const url = 'http://localhost:8080/api/v1/auth/login';
    
    // Данные тестового юзера, которого мы создали в Assignment 2
    const payload = {
        login: 'ci_automation@gmail.com',
        password: 'CI_Test_Pass_123!',
    };

    // Отправляем POST запрос
    const res = http.post(url, payload);

    // Проверяем, не упал ли сервер от нагрузки (ждем 200 OK)
    check(res, {
        'is status 200': (r) => r.status === 200,
    });

    // Пауза 1 секунда между попытками каждого "виртуального пользователя"
    sleep(1);
}