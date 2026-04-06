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

        # ── Super Admin ───────────────────────────────────────────────────
        admin_phone = "+77000000001"
        existing_admin = db.query(User).filter(User.phone == admin_phone).first()
        if not existing_admin:
            admin = User(
                organization_id=hq_org.id if hq_org else None,
                role=UserRole.SUPER_ADMIN.value,
                full_name="Администратор",
                phone=admin_phone,
                email="admin@mooztau.kz",
                password_hash=hash_password("admin123"),
            )
            db.add(admin)
            print(f"  Created super admin: {admin_phone} / admin123")
        else:
            print(f"  Super admin already exists: {admin_phone}")

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
