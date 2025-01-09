from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal

app = FastAPI()

# Разрешаем доступ из любого источника для тестирования
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель продукта
class Product(BaseModel):
    name: str
    product_type: str
    manufacture_date: str  # Формат даты: YYYY-MM-DD
    expiry_date: str       # Формат даты: YYYY-MM-DD
    mass: float
    unit: Literal["г", "кг", "мл", "л"]
    nutritional_value: str

# Тестовые данные
products = [
    {
        "name": "Молоко",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
     {
        "name": "Молокоo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
      {
        "name": "Молокоoo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
       {
        "name": "Молокоooo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
        {
        "name": "Молокоoooo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
         {
        "name": "Молокоoooooo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
        "mass": 1.0,
        "unit": "л",
        "nutritional_value": "50 ккал/100 мл",
    },
          {
        "name": "Молокоoooooooo",
        "product_type": "Молочные продукты",
        "manufacture_date": "2025-01-01",
        "expiry_date": "2025-01-10",
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
        "name": "Яйца",
        "product_type": "Птицеводство",
        "manufacture_date": "2025-01-02",
        "expiry_date": "2025-01-12",
        "mass": 0.7,
        "unit": "кг",
        "nutritional_value": "155 ккал/100 г",
    },
    {
        "name": "Сыр",
        "product_type": "Молочные продукты",
        "manufacture_date": "2024-12-28",
        "expiry_date": "2025-01-06",
        "mass": 0.3,
        "unit": "кг",
        "nutritional_value": "350 ккал/100 г",
    },
    {
        "name": "Помидоры",
        "product_type": "Овощи",
        "manufacture_date": "2025-01-03",
        "expiry_date": "2025-01-08",
        "mass": 1.5,
        "unit": "кг",
        "nutritional_value": "18 ккал/100 г",
    },
]

@app.get("/refrigerator-products", response_model=List[Product])
async def get_products():
    """
    Возвращает список продуктов в холодильнике.
    """
    return products

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
