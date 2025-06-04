// src/components/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    // сюда будет класться объект с /auth/me + isSubscribed
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    // 1) Сначала получаем основную информацию о пользователе
    fetch("/api/v1/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          // 401 или другая ошибка — значит не залогинен
          throw new Error("Не авторизован");
        }
        return res.json();
      })
      .then(async (userData) => {
        // В ответе от /auth/me, скорее всего, нет поля "subscribe" в виде JS-массива
        // Поэтому сейчас userData просто содержит id, name, email, balance и т. д.
        // Чтобы узнать, есть ли у пользователя активная подписка, делаем второй запрос:
        //
        // GET /api/v1/subscribe/
        //   — если статус 200 → подписан
        //   — если 404  → не подписан

        let isSubscribed = false;
        try {
          const subRes = await fetch("/api/v1/subscribe/", {
            credentials: "include",
          });
          if (subRes.ok) {
            // 200 OK — значит подписка есть
            isSubscribed = true;
          } else {
            // 404 → подписки нет (или другой код), оставляем false
            isSubscribed = false;
          }
        } catch {
          isSubscribed = false;
        }

        // Собираем единый объект user, добавляя к нему поле isSubscribed
        setUser({
          ...userData,
          isSubscribed,
        });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
