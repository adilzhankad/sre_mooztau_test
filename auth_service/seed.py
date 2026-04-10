"""
Idempotent seed script for the auth service.
Creates 10 organizations and 1 super admin user.

Usage:
    python seed.py
"""

from database import SessionLocal, engine, Base
from models import Organization, User, OrgType, UserRole
from security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Organizations ─────────────────────────────────────────────────
        organizations = [
            {"name": "MoozTau", "org_type": "HQ", "region": "Алматы", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "MT Астана", "org_type": "DEALER", "region": "Астана", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "MT Алматы", "org_type": "BRANCH", "region": "Алматы", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Каспи Магазин", "org_type": "BRANCH", "region": "Алматы", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "B2B", "org_type": "BRANCH", "region": "Алматы", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Ayza", "org_type": "DEALER", "region": "Шымкент", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Umag Шым", "org_type": "DEALER", "region": "Шымкент", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Umag Тараз", "org_type": "DEALER", "region": "Тараз", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Диллер Болат", "org_type": "DEALER", "region": "Астана", "contact_phone": "", "contact_email": "", "address": ""},
            {"name": "Айзберг", "org_type": "DEALER", "region": "Алматы", "contact_phone": "", "contact_email": "", "address": ""},
        ]

        hq_org = None
        for org_data in organizations:
            existing = db.query(Organization).filter(Organization.name == org_data["name"]).first()
            if not existing:
                org = Organization(**org_data)
                db.add(org)
                db.flush()
                if org_data["name"] == "MoozTau":
                    hq_org = org
                print(f"  Created organization: {org_data['name']}")
            else:
                if org_data["name"] == "MoozTau":
                    hq_org = existing
                print(f"  Organization already exists: {org_data['name']}")

        # ── Users (one per role) ──────────────────────────────────────────
        dealer_org = db.query(Organization).filter(Organization.name == "MT Астана").first()

        seed_users = [
            {
                "phone": "+77000000001",
                "role": UserRole.SUPER_ADMIN,
                "full_name": "Администратор",
                "email": "admin@mooztau.kz",
                "organization": hq_org,
            },
            {
                "phone": "+77000000002",
                "role": UserRole.DEALER_ADMIN,
                "full_name": "Дилер Админ",
                "email": "dealer_admin@mooztau.kz",
                "organization": dealer_org,
            },
            {
                "phone": "+77000000003",
                "role": UserRole.DEALER_MANAGER,
                "full_name": "Дилер Менеджер",
                "email": "dealer_manager@mooztau.kz",
                "organization": dealer_org,
            },
            {
                "phone": "+77000000004",
                "role": UserRole.FACTORY_ADMIN,
                "full_name": "Фабрика Админ",
                "email": "factory_admin@mooztau.kz",
                "organization": hq_org,
            },
            {
                "phone": "+77000000005",
                "role": UserRole.FACTORY_WORKER,
                "full_name": "Фабрика Работник",
                "email": "factory_worker@mooztau.kz",
                "organization": hq_org,
            },
        ]

        for u in seed_users:
            existing = db.query(User).filter(User.phone == u["phone"]).first()
            if not existing:
                user = User(
                    organization_id=u["organization"].id if u["organization"] else None,
                    role=u["role"].value,
                    full_name=u["full_name"],
                    phone=u["phone"],
                    email=u["email"],
                    password_hash=hash_password("admin123"),
                )
                db.add(user)
                print(f"  Created {u['role'].value}: {u['phone']} / admin123")
            else:
                print(f"  {u['role'].value} already exists: {u['phone']}")

        db.commit()
        print("\nSeed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"\nSeed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding auth_service database...\n")
    seed()
