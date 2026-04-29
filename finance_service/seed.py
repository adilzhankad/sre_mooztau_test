from database import Base, SessionLocal, engine
from models import BankAccount, ExpenseCategory

ACCOUNTS = [
    ("Kaspi Основной", "Kaspi Bank"),
    ("Halyk Корп", "Halyk Bank"),
    ("БЦК", "Банк ЦентрКредит"),
    ("Bereke", "Bereke Bank"),
    ("Forte", "ForteBank"),
    ("Касса", "Наличные"),
]

ROOT_CATEGORIES = [
    "Сырьё и материалы",
    "Зарплата и HR",
    "Логистика и доставка",
    "Аренда и коммунальные",
    "Маркетинг и реклама",
    "Оборудование и ремонт",
    "Налоги и сборы",
    "Прочие расходы",
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(BankAccount).count() == 0:
            for name, bank in ACCOUNTS:
                db.add(BankAccount(name=name, bank_name=bank))
            db.commit()
            print(f"Seeded {len(ACCOUNTS)} bank accounts")

        if db.query(ExpenseCategory).count() == 0:
            for cat_name in ROOT_CATEGORIES:
                db.add(ExpenseCategory(name=cat_name, level=1))
            db.commit()
            print(f"Seeded {len(ROOT_CATEGORIES)} root categories")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
