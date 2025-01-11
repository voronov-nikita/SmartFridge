const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Секретный ключ для подписи токенов
const SECRET_KEY = 'ABC12BCA21';
const REFRESH_SECRET_KEY = 'QWERTY';
const TOKEN_EXPIRATION = '1h'; // Время жизни access токена (поставлено на 1 час)
const REFRESH_TOKEN_EXPIRATION = '7d'; // Время жизни refresh токена (поставлено на 7 дней)

// Мок-данные для теста
const mockUsers = [
    { login: 'admin', password: 'admin' },
    { login: 'user', password: 'password' },
];

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8081', // Уберите завершающий слэш
    credentials: true,
}));

// Эндпоинт авторизации
app.post('/auth', (req, res) => {
    const { login, password } = req.body;
    const user = mockUsers.find(u => u.login === login && u.password === password);

    if (user) {
        // Генерация токенов
        const accessToken = jwt.sign({ login }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ login }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });

        // Отправляем токен пользователю
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
        });
        return res.json({ access: accessToken, expiresIn: 3600 });
    }

    return res.status(401).json({ message: 'Неверный логин или пароль' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://192.168.0.9:${PORT}`);
});