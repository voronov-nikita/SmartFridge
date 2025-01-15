from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

# Настройки базы данных
DATABASE_URL = "sqlite:///./qr_data.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# модель пользователей
class User(Base): 
    tablename = "users" 
    id = Column(Integer, primary_key=True, index=True) 
    login = Column(String, unique=True, nullable=False) 
    email = Column(String, unique=True, nullable=False) 
    password = Column(String, nullable=False)

# Модель данных для БД
class QRData(Base):
    __tablename__ = "qr_data"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(JSON, nullable=False)

class Fridge(Base):
    __tablename__ = "fridges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, unique=True)

# модель пользователя
class UserCreate(BaseModel): 
    login: str 
    email: str 
    password: str

# Модель продуктов
class Product(BaseModel):
    name: str
    product_type: str
    manufacture_date: str  # Формат даты: YYYY-MM-DD
    expiry_date: str       # Формат даты: YYYY-MM-DD
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str

# модель холодильника
class FridgeModel(BaseModel):
    id: int
    title: str

class NewFridgeModel(BaseModel):
    title: str

class AuthRequest(BaseModel):
    login: str
    password: str

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Инициализация приложения
app = FastAPI()

# Разрешенные источники
origins = [
    "http://192.168.0.16:8081",
    "http://localhost:8081",  # Фронтенд, с которого будут приходить запросы
    "http://localhost",       # Разрешаем локальный хост
]

# Добавляем middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Указываем разрешенные источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP-методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Константы для JWT
SECRET_KEY = "ABC12BCA21"
REFRESH_SECRET_KEY = "QWERTY"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Мок-данные для теста
mock_users = [
    {"login": "admin", "password": "admin"},
    {"login": "user", "password": "password"},
]

# Тестовые данные для холодильника
products = [
    {
        "id": 1,
        "name": "Молоко",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-18",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
    {
        "id": 2,
        "name": "Хлеб",
        "product_type": "Выпечка",
        "manufacture_date": "2025-01-05",
        "expiry_date": "2025-01-07",
        "mass": 0.5,
        "unit": "кг",
        "nutritional_value": "250 ккал/100 г",
    },
    {
        "id": 3,
        "name": "Соль",
        "product_type": "Приправы",
        "manufacture_date": "2025-01-09",
        "expiry_date": "2025-01-14",
        "mass": 1,
        "unit": "кг",
        "nutritional_value": "24 ккал/100 г",
    },
]


def hash_password(password: str) -> str: 
    return pwd_context.hash(password)

# @app.post("/reg", response_model=UserCreate) 
# async def register(user: UserCreate, db: Session = Depends(get_db)): 
#     # Проверка, существует ли уже пользователь 
#     existing_user = db.query(User).filter((User .email == user.email) | (User .login == user.login)).first() 
#     if existing_user: 
#         raise HTTPException(status_code=400, detail="Email или login уже зарегистрированы")
    
#     hashed_password = hash_password(user.password)
#     new_user = User(login=user.login, email=user.email, password=hashed_password)

#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)

#     return {"login": new_user.login, "email": new_user.email}

# Функция для генерации токенов
def create_token(data: dict, secret_key: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm="HS256")

# Эндпоинт авторизации
@app.post("/auth")
async def auth(request_data: AuthRequest, response: Response):
    # Ищем пользователя в базе
    user = next((u for u in mock_users if u["login"] == request_data.login and u["password"] == request_data.password), None)

    if user:
        # Генерация токенов
        access_token = create_token({"login": request_data.login}, SECRET_KEY, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        refresh_token = create_token({"login": request_data.login}, REFRESH_SECRET_KEY, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

        # Установка куки с refresh-токеном
        response.set_cookie(
            key="refreshToken",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="strict"
        )

        # Возврат access-токена и времени его жизни
        return {"access": access_token, "expiresIn": 3600}

    # Если пользователь не найден, возвращаем ошибку
    raise HTTPException(status_code=401, detail="Invalid login or password")


@app.get("/refrigerator-products", response_model=List[Product])
async def get_products():
    """
    Возвращает список продуктов в холодильнике.
    """
    return products

@app.delete("/refrigerator-products/{product_id}", response_model=Product)
async def delete_product(product_id: str):
    """
    Удаляет продукт из списка продуктов по имени.
    """
    # Поиск продукта
    product = next((p for p in products if p["id"] == product_id), None)
    
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")
    
    # Удаление продукта
    products.remove(product)
    
    return product

@app.post("/qr-data")
async def save_qr_data(data: dict):
    """
    Сохраняет данные, полученные из QR-кода, в базу данных.
    """
    try:
        db = SessionLocal()
        qr_data = QRData(content=data)
        db.add(qr_data)
        db.commit()
        db.refresh(qr_data)
        return {"message": "QR data saved successfully", "id": qr_data.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/newfridge", response_model=FridgeModel)
async def create_new_fridge(new_fridge: NewFridgeModel):
    """
    Добавляет новый холодильник.
    """
    db = SessionLocal()
    try:
        fridge = Fridge(title=new_fridge.title)
        db.add(fridge)
        db.commit()
        db.refresh(fridge)
        return {"id": fridge.id, "title": fridge.title}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Холодильник с таким названием уже существует.")
    finally:
        db.close()

@app.get("/fridge", response_model=List[FridgeModel])
async def get_fridges():
    """
    Возвращает список всех холодильников.
    """
    db = SessionLocal()
    try:
        fridges = db.query(Fridge).all()
        return [{"id": fridge.id, "title": fridge.title} for fridge in fridges]
    finally:
        db.close()

# Автоматический запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
