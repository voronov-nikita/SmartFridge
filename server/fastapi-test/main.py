from fastapi import FastAPI, HTTPException, Response, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Dict
from sqlalchemy import create_engine, Column, Integer, String, JSON, Float, func
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

# Модель корзины (или списка покупок)
class ShoppingCart(Base):
    __tablename__ = "shopping"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Название продукта
    product_type = Column(String, nullable=False)  # Тип продукции
    fridge_id = Column(Integer, nullable=False)  # ID холодильника
    mass = Column(String, nullable=False)  # Масса продукта
    user_id = Column(Integer, nullable=False)  # ID пользователя


class Fridge(Base):
    __tablename__ = "fridges"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, unique=True)
    user_id = Column(Integer, nullable=False)  # Привязка к конкретному пользователю


# Модель пользователя для регистрации
class UserCreate(BaseModel):
    login: str
    email: str
    password: str

class UserResponse(BaseModel):
    login: str
    email: str
    
class ProductStatResponse(BaseModel):
    name: str
    quantity: int
    mass: str
    type: str

class TopProductsResponse(BaseModel):
    day: List[ProductStatResponse]
    week: List[ProductStatResponse]
    month: List[ProductStatResponse]

class ShoppingCartCreate(BaseModel):
    name: str
    fridge_id: int
    mass: str
    product_type: str

class StatisticDB(Base):
    __tablename__ = "statistics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    mass = Column(String)
    quantity_day = Column(Integer, default=0)
    quantity_week = Column(Integer, default=0)
    quantity_month = Column(Integer, default=0)
    user_id = Column(Integer, nullable=False)

# Модель для авторизации
class AuthRequest(BaseModel):
    login: str
    password: str

# Модель продуктов
class ProductDB(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    product_type = Column(String, nullable=False)
    manufacture_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    mass = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    nutritional_value = Column(String, nullable=False)
    fridge_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)  # ID пользователя

class ShopCreate(BaseModel):
    name: str
    fridge_id: int
    mass: int

class ProductCreate(BaseModel):
    name: str
    product_type: str
    manufacture_date: str
    expiry_date: str
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str
    fridge_id: int
    user_id: int

class ProductResponse(BaseModel):
    id: int
    name: str
    product_type: str
    manufacture_date: str
    expiry_date: str
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str
    fridge_id: int
    user_id: int

# Модель холодильника
class FridgeModel(BaseModel):
    id: int
    title: str

class NewFridgeModel(BaseModel):
    title: str
    user_id: int
    
class Product(BaseModel):
    name: str
    quantity: int
    type: str
    mass: str

class UpdateProduct(BaseModel):
    name: str
    type: str
    mass: str
    quantity: int
    
# Модель для данных продукта с user_id
class ProductCreate(BaseModel):
    name: str
    product_type: str
    manufacture_date: str
    expiry_date: str
    mass: float
    unit: str
    nutritional_value: str
    fridge_id: int
    user_id: int  # Добавляем поле user_id в модель

# Модель для ответа
class ProductResponse(BaseModel):
    id: int
    name: str
    product_type: str
    fridge_id: int
    user_id: int

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Инициализация приложения
app = FastAPI()

# Разрешенные источники
origins = [
    "http://192.168.0.10"
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
async def register(user: UserCreate, db: Session = Depends(get_db)):
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
        return {"access": access_token, "expiresIn": 3600, "userId": user.id}

    # Если пользователь не найден или пароль неверный
    raise HTTPException(status_code=401, detail="Invalid login or password")

# Эндпоинт для получения всех товаров из корзины
@app.get("/shopping/{user_id}", response_model=List[dict])
async def get_all_cart_items(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(ShoppingCart).filter(ShoppingCart.user_id == user_id).all()

    if not cart_items:
        return []

    return [
        {
            "id": item.id,
            "name": item.name,
            "product_type": item.product_type,
            "fridge_id": item.fridge_id,
            "mass": item.mass,
        }
        for item in cart_items
    ]

# Эндпоинт для добавления продукта в корзину
@app.post("/shopping/{user_id}", response_model=dict)
async def add_to_cart(user_id: int, item: ShoppingCartCreate, db: Session = Depends(get_db)):
    try:
        fridge = db.query(Fridge).filter(Fridge.id == item.fridge_id).first()
        if not fridge:
            raise HTTPException(status_code=404, detail="Холодильник не найден")

        new_item = ShoppingCart(
            name=item.name,
            fridge_id=item.fridge_id,
            mass=item.mass,
            product_type=item.product_type,
            user_id=user_id,
        )

        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return {
            "id": new_item.id,
            "name": new_item.name,
            "fridge_id": new_item.fridge_id,
            "product_type": new_item.product_type,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении в корзину: {str(e)}")


# Эндпоинт для удаления продукта из корзины
@app.delete("/shopping/{user_id}/{item_id}", response_model=dict)
async def remove_from_cart(user_id: int, item_id: int, db: Session = Depends(get_db)):
    try:
        cart_item = db.query(ShoppingCart).filter(
            ShoppingCart.id == item_id, ShoppingCart.user_id == user_id
        ).first()

        if not cart_item:
            raise HTTPException(status_code=404, detail="Продукт не найден в корзине")

        db.delete(cart_item)
        db.commit()

        return {"detail": "Продукт успешно удален из корзины"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении продукта из корзины: {str(e)}")


@app.post("/products", response_model=ProductResponse)
async def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли холодильник, который принадлежит данному пользователю
    fridge = db.query(Fridge).filter(Fridge.id == product.fridge_id, Fridge.user_id == product.user_id).first()
    if not fridge:
        raise HTTPException(status_code=404, detail="Холодильник не найден или не принадлежит пользователю")

    # Создаем новый продукт
    new_product = ProductDB(
        name=product.name,
        product_type=product.product_type,
        manufacture_date=product.manufacture_date,
        expiry_date=product.expiry_date,
        mass=product.mass,
        unit=product.unit,
        nutritional_value=product.nutritional_value,
        fridge_id=product.fridge_id,
        user_id=product.user_id,  # user_id теперь передается из данных запроса
    )

    # Сохраняем продукт в базе
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@app.get("/products/{user_id}")
async def get_all_products(user_id: int, db: Session = Depends(get_db)):
    products = db.query(ProductDB).filter(ProductDB.user_id == user_id).all()

    grouped_products = {}
    for product in products:
        if product.fridge_id not in grouped_products:
            grouped_products[product.fridge_id] = []
        grouped_products[product.fridge_id].append({
            "id": product.id,
            "name": product.name,
            "product_type": product.product_type,
            "manufacture_date": product.manufacture_date,
            "expiry_date": product.expiry_date,
            "mass": product.mass,
            "unit": product.unit,
            "nutritional_value": product.nutritional_value,
            "fridge_id": product.fridge_id
        })

    return grouped_products


# Эндпоинт для удаления продукта
@app.delete("/deleteproduct/{product_id}", response_model=dict)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    try:
        # Ищем продукт в базе данных по id
        product = db.query(ProductDB).filter(ProductDB.id == product_id).first()

        # Если продукт не найден, выбрасываем исключение
        if not product:
            raise HTTPException(status_code=404, detail="Продукт не найден")

        # Удаляем продукт из базы данных
        db.delete(product)
        db.commit()

        # Возвращаем успешный ответ
        return {"detail": "Продукт успешно удален"}

    except Exception as e:
        # Если произошла ошибка, откатываем транзакцию и выбрасываем исключение
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении продукта: {str(e)}")

    finally:
        db.close()

# Все продукты определнного холодильника
@app.get("/fridge/{fridge_id}", response_model=List[ProductResponse])
async def get_products_by_fridge(fridge_id: int, db: Session = Depends(get_db)):
    products = db.query(ProductDB).filter(
        ProductDB.fridge_id == fridge_id
    ).all()

    if not products:
        return []

    return products

# удалить определнный холодильник
@app.delete("/fridge/{fridge_id}", response_model=dict)
async def delete_fridge(fridge_id: int, user_id: int, db: Session = Depends(get_db)):
    try:
        fridge = db.query(Fridge).filter(Fridge.id == fridge_id, Fridge.user_id == user_id).first()

        if not fridge:
            raise HTTPException(status_code=404, detail="Холодильник не найден или доступ запрещен.")

        db.delete(fridge)
        db.commit()
        return {"detail": "Холодильник успешно удален"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении холодильника: {str(e)}")


# Пример эндпоинта для создания холодильника
@app.post("/newfridge")
async def create_new_fridge(new_fridge: NewFridgeModel, db: Session = Depends(get_db)):
    try:
        # Создаем холодильник с переданным user_id
        fridge = Fridge(title=new_fridge.title, user_id=new_fridge.user_id)
        db.add(fridge)
        db.commit()
        db.refresh(fridge)
        return {"id": fridge.id, "title": fridge.title, "user_id": new_fridge.user_id}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Холодильник с таким названием уже существует.")


@app.get("/fridges/{user_id}", response_model=List[FridgeModel])
async def get_fridges(user_id: int, db: Session = Depends(get_db)):
    try:
        fridges = db.query(Fridge).filter(Fridge.user_id == user_id).all()
        return [{"id": fridge.id, "title": fridge.title} for fridge in fridges]
    finally:
        db.close()

@app.get("/top-products/{user_id}", response_model=TopProductsResponse)
async def get_top_products(user_id: int, db: Session = Depends(get_db)):
    try:
        # Получаем все статистики пользователя
        statistics = db.query(StatisticDB).filter(StatisticDB.user_id == user_id).all()

        if not statistics:
            raise HTTPException(status_code=404, detail="Статистика не найдена для этого пользователя")

        # Формируем ответ с данными за день, неделю и месяц
        result = {
            "day": [],
            "week": [],
            "month": []
        }

        for stat in statistics:
            result["day"].append({"name": stat.name, "quantity": stat.quantity_day, "mass": stat.mass, "type": stat.type})
            result["week"].append({"name": stat.name, "quantity": stat.quantity_week, "mass": stat.mass, "type": stat.type})
            result["month"].append({"name": stat.name, "quantity": stat.quantity_month, "mass": stat.mass, "type": stat.type})

        # Сортировка данных по количеству продуктов
        for period in result:
            result[period] = sorted(result[period], key=lambda x: x['quantity'], reverse=True)

        # Возвращаем результат в формате Pydantic модели
        return TopProductsResponse(**result)

    except Exception as e:
        print(f"Ошибка: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения топ-продуктов: {str(e)}")
    finally:
        db.close()

@app.post("/update-product/{user_id}")
async def update_product(user_id: int, update: UpdateProduct, db: Session = Depends(get_db)):
    try:
        # Найти продукт по имени и user_id
        product = db.query(StatisticDB).filter(StatisticDB.name == update.name, StatisticDB.user_id == user_id).first()
        
        if product:
            # Обновляем количество для текущего продукта
            product.quantity_day += update.quantity
            product.quantity_week += update.quantity
            product.quantity_month += update.quantity
        else:
            # Если продукт не найден, создаем новый
            product = StatisticDB(
                name=update.name,
                type=update.type,
                mass=update.mass,
                quantity_day=update.quantity,
                quantity_week=update.quantity,
                quantity_month=update.quantity,
                user_id=user_id
            )
            db.add(product)
        
        # Сохраняем изменения в базе данных
        db.commit()
        return {"message": "Product updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")


# Автоматический запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
