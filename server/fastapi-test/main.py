from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

# Настройки базы данных
DATABASE_URL = "sqlite:///./data.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Модель пользователей
class User(Base):
    __tablename__ = "users"
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

# Модель пользователя для регистрации
class UserCreate(BaseModel):
    login: str
    email: str
    password: str

class UserResponse(BaseModel):
    login: str
    email: str

# Модель для авторизации
class AuthRequest(BaseModel):
    login: str
    password: str

# Модель продуктов
class Product(BaseModel):
    name: str
    product_type: str
    manufacture_date: str
    expiry_date: str
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str

# Модель холодильника
class FridgeModel(BaseModel):
    id: int
    title: str

class NewFridgeModel(BaseModel):
    title: str

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Инициализация приложения
app = FastAPI()

# Разрешенные источники
origins = [
    "http://192.168.0.16",
    "http://localhost:8081",
    "http://localhost",
]

# Добавляем middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Константы для JWT
SECRET_KEY = "ABC12BCA21"
REFRESH_SECRET_KEY = "QWERTY"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Функция для хэширования паролей
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Функция для проверки пароля
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Функция для генерации токенов
def create_token(data: dict, secret_key: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm="HS256")

# Зависимость для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Эндпоинт регистрации
@app.post("/reg", response_model=UserResponse)
async def register(user: UserCreate):
    db = SessionLocal()
    try:
        # Проверяем, существует ли пользователь
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.login == user.login)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email или login уже зарегистрированы")

        # Хэшируем пароль
        hashed_password = hash_password(user.password)
        new_user = User(login=user.login, email=user.email, password=hashed_password)

        # Сохраняем пользователя в базе
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Возвращаем только login и email
        return {"login": new_user.login, "email": new_user.email}
    finally:
        db.close()


# Эндпоинт авторизации
@app.post("/auth")
async def auth(request_data: AuthRequest, response: Response, db: Session = Depends(get_db)):
    # Поиск пользователя в базе
    user = db.query(User).filter(User.login == request_data.login).first()

    if user and verify_password(request_data.password, user.password):
        # Генерация токенов
        access_token = create_token({"login": user.login}, SECRET_KEY, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        refresh_token = create_token({"login": user.login}, REFRESH_SECRET_KEY, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

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

    # Если пользователь не найден или пароль неверный
    raise HTTPException(status_code=401, detail="Invalid login or password")

# Пример эндпоинта для получения списка продуктов
@app.get("/refrigerator-products", response_model=List[Product])
async def get_products():
    return []  # Здесь можно заменить на запрос к базе данных

# Пример эндпоинта для создания холодильника
@app.post("/newfridge", response_model=FridgeModel)
async def create_new_fridge(new_fridge: NewFridgeModel, db: Session = Depends(get_db)):
    try:
        fridge = Fridge(title=new_fridge.title)
        db.add(fridge)
        db.commit()
        db.refresh(fridge)
        return {"id": fridge.id, "title": fridge.title}
    except Exception:
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
