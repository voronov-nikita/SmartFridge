from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Настройки базы данных
DATABASE_URL = "sqlite:///./qr_data.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Модель данных для БД
class QRData(Base):
    __tablename__ = "qr_data"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(JSON, nullable=False)

# Модель продуктов
class Product(BaseModel):
    name: str
    product_type: str
    manufacture_date: str  # Формат даты: YYYY-MM-DD
    expiry_date: str       # Формат даты: YYYY-MM-DD
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Тестовые данные
products = [
    {
        "name": "Молоко",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-18",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
    {
        "name": "Хлеб",
        "product_type": "Выпечка",
        "manufacture_date": "2025-01-05",
        "expiry_date": "2025-01-07",
        "mass": 0.5,
        "unit": "кг",
        "nutritional_value": "250 ккал/100 г",
    },
    {
        "name": "Соль",
        "product_type": "Приправы",
        "manufacture_date": "2025-01-09",
        "expiry_date": "2025-01-14",
        "mass": 1,
        "unit": "кг",
        "nutritional_value": "24 ккал/100 г",
    },
]

# Инициализация приложения
app = FastAPI()

# Разрешаем доступ из любого источника для тестирования
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/refrigerator-products", response_model=List[Product])
async def get_products():
    """
    Возвращает список продуктов в холодильнике.
    """
    return products

@app.delete("/refrigerator-products/{product_name}", response_model=Product)
async def delete_product(product_name: str):
    """
    Удаляет продукт из списка продуктов по имени.
    """
    # Поиск продукта
    product = next((p for p in products if p["name"] == product_name), None)
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
