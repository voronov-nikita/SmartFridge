import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from telegram.ext import ConversationHandler
from datetime import datetime, timedelta
import re

# Логирование
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "6217480872:AAHAasPQDbUYsI0j6eSAwBanXtkZ1xq99fc"
API_BASE_URL = "http://localhost:8000"  # URL вашего FastAPI сервера

# Константы для ConversationHandler
LOGIN, PASSWORD = range(2)

# Словарь для хранения временных данных о пользователях
temp_user_data = {}

# Команда /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Добро пожаловать! Пожалуйста, введите ваш логин для авторизации."
    )
    return LOGIN

# Обработка логина
async def handle_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    temp_user_data[user_id] = {"login": update.message.text}
    await update.message.reply_text("Спасибо! Теперь введите ваш пароль.")
    return PASSWORD

# Обработка пароля и авторизация
async def handle_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    temp_user_data[user_id]["password"] = update.message.text

    # Отправка данных на сервер
    auth_data = {
        "login": temp_user_data[user_id]["login"],
        "password": temp_user_data[user_id]["password"],
    }
    response = requests.post(f"{API_BASE_URL}/auth", json=auth_data)

    if response.status_code == 200:
        # Авторизация успешна
        user_data = response.json()
        context.user_data["user_id"] = user_data["userId"]
        await update.message.reply_text(
            f"Авторизация успешна! Ваш пользовательский ID: {user_data['userId']}"
        )
        del temp_user_data[user_id]  # Удаляем временные данные
        return ConversationHandler.END
    else:
        # Ошибка авторизации
        await update.message.reply_text(
            "Ошибка авторизации. Пожалуйста, проверьте логин и пароль и попробуйте снова."
        )
        return LOGIN

# Завершение диалога
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id in temp_user_data:
        del temp_user_data[user_id]  # Удаляем временные данные
    await update.message.reply_text("Авторизация отменена.")
    return ConversationHandler.END


# Функция для экранирования специальных символов для MarkdownV2
def escape_markdown_v2(text: str) -> str:
    # Экранируем все символы, которые могут быть интерпретированы как Markdown элементы
    return re.sub(r'([\\_*[\]()>#+-.!])', r'\\\1', text)

async def check_fridge(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = context.user_data.get("user_id")
    if not user_id:
        await update.message.reply_text(
            "Вы не авторизованы. Используйте команду /start для авторизации."
        )
        return

    # Шаг 1: Запрос списка холодильников
    fridges_response = requests.get(f"{API_BASE_URL}/fridges/{user_id}")
    if fridges_response.status_code != 200:
        await update.message.reply_text(
            "Не удалось получить список холодильников. Попробуйте позже."
        )
        return

    fridges_data = fridges_response.json()

    if not fridges_data:
        await update.message.reply_text("У вас нет холодильников.")
        return

    # Шаг 2: Для каждого холодильника запрашиваем продукты
    message = "Содержимое ваших холодильников:\n"
    today = datetime.today()
    soon_expiry_threshold = today + timedelta(days=3)  # Порог для истечения срока годности

    for fridge in fridges_data:
        fridge_id = fridge['id']
        fridge_title = fridge['title']

        # Экранируем название холодильника
        fridge_title = escape_markdown_v2(fridge_title)

        # Жирный текст для названия холодильника
        message += f"<b>{fridge_title}</b>:\n"

        # Запрос продуктов для данного холодильника
        products_response = requests.get(f"{API_BASE_URL}/fridge/{fridge_id}")
        if products_response.status_code != 200:
            message += f"\tОшибка при загрузке продуктов.\n"
            continue

        products_data = products_response.json()

        # Если продуктов нет
        if not products_data:
            message += f"\tПусто.\n"
            continue

        # Формируем список продуктов
        for product in products_data:
            product_name = product.get('name', 'Неизвестный продукт')
            expiry_date_raw = product.get('expiry_date', None)

            # Экранируем название продукта
            product_name = escape_markdown_v2(product_name)

            # Переформатируем дату
            if expiry_date_raw:
                expiry_date = datetime.strptime(expiry_date_raw, "%Y-%m-%d")
                formatted_date = expiry_date.strftime("%d-%m-%Y")
            else:
                formatted_date = "Дата не указана"

            # Проверяем истекающий срок годности
            if expiry_date_raw and expiry_date <= soon_expiry_threshold:
                product_name = f"<u>{product_name}</u>"  # Подчеркиваем продукт
                formatted_date += " ⚠️"

            message += f"\t{product_name}: {formatted_date}\n"

    # Отправляем результат пользователю
    # parse_mode="MarkdownV2"
    await update.message.reply_text(message, parse_mode="HTML")


# Основной запуск
def main():
    application = Application.builder().token(BOT_TOKEN).build()

    # ConversationHandler для авторизации
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            LOGIN: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_login)],
            PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_password)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    # Регистрируем обработчики
    application.add_handler(conv_handler)
    application.add_handler(CommandHandler("check_fridge", check_fridge))

    # Запускаем бота
    logger.info("Запуск бота...")
    application.run_polling()

if __name__ == "__main__":
    main()
