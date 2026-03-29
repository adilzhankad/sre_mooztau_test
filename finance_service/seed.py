"""
Seed default bank accounts and root categories for the finance service.
Run: python -m seed
"""

from database import SessionLocal, engine, Base
from models import BankAccount, Category, Transaction  # noqa


DEFAULT_BANK_ACCOUNTS = [
    "Kaspi",
    "Halyk",
    "БЦК",
    "Bereke",
    "Forte",
    "Наличными",
]

DEFAULT_ROOT_CATEGORIES = [
    "Офис Алматы",
    "Офис Тараз",
    "Цех Кулан",
    "Склад Кулан",
    "Продажа",
    "Финансы",
    "Сервис Шымкент",
    "Сервис Алматы",
]


def seed():
    # Create fin_* tables if they don't exist
    fin_tables = [t for n, t in Base.metadata.tables.items() if n.startswith("fin_")]
    Base.metadata.create_all(bind=engine, tables=fin_tables)

    db = SessionLocal()
    try:
        # Seed bank accounts
        for name in DEFAULT_BANK_ACCOUNTS:
            exists = db.query(BankAccount).filter(BankAccount.name == name).first()
            if not exists:
                db.add(BankAccount(name=name, balance=0))
                print(f"  [+] Банковский счёт: {name}")
            else:
                print(f"  [=] Банковский счёт уже есть: {name}")

        # Seed root categories (level 1)
        for name in DEFAULT_ROOT_CATEGORIES:
            exists = db.query(Category).filter(Category.name == name, Category.level == 1).first()
            if not exists:
                cat = Category(name=name, parent_id=None, level=1, full_path=name)
                db.add(cat)
                print(f"  [+] Категория: {name}")
            else:
                print(f"  [=] Категория уже есть: {name}")

        db.commit()
        print("\nSeed завершён успешно.")
    except Exception as e:
        db.rollback()
        print(f"Ошибка при seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
