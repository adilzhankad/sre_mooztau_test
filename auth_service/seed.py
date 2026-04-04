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
            {
                "name": "MoozTau HQ",
                "org_type": OrgType.HQ.value,
                "contact_phone": "+77001001010",
                "contact_email": "hq@mooztau.kz",
                "address": "Astana, Mangilik El 1",
                "region": "Astana",
            },
            {
                "name": "MoozTau Almaty Branch",
                "org_type": OrgType.BRANCH.value,
                "contact_phone": "+77272001010",
                "contact_email": "almaty@mooztau.kz",
                "address": "Almaty, Abay Ave 10",
                "region": "Almaty",
            },
            {
                "name": "MoozTau Shymkent Branch",
                "org_type": OrgType.BRANCH.value,
                "contact_phone": "+77252001010",
                "contact_email": "shymkent@mooztau.kz",
                "address": "Shymkent, Tauke Khan 50",
                "region": "Turkistan",
            },
            {
                "name": "Dealer Astana Premium",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015001010",
                "contact_email": "astana-premium@dealer.kz",
                "address": "Astana, Kabanbay Batyr 5",
                "region": "Astana",
            },
            {
                "name": "Dealer Almaty Gold",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015002020",
                "contact_email": "almaty-gold@dealer.kz",
                "address": "Almaty, Dostyk Ave 200",
                "region": "Almaty",
            },
            {
                "name": "Dealer Karaganda",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015003030",
                "contact_email": "karaganda@dealer.kz",
                "address": "Karaganda, Bukhar Zhyrau 50",
                "region": "Karaganda",
            },
            {
                "name": "Dealer Aktobe",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015004040",
                "contact_email": "aktobe@dealer.kz",
                "address": "Aktobe, Abil Khan 15",
                "region": "Aktobe",
            },
            {
                "name": "Dealer Atyrau",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015005050",
                "contact_email": "atyrau@dealer.kz",
                "address": "Atyrau, Satpaev 22",
                "region": "Atyrau",
            },
            {
                "name": "Dealer Kostanay",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015006060",
                "contact_email": "kostanay@dealer.kz",
                "address": "Kostanay, Al-Farabi 8",
                "region": "Kostanay",
            },
            {
                "name": "Dealer Pavlodar",
                "org_type": OrgType.DEALER.value,
                "contact_phone": "+77015007070",
                "contact_email": "pavlodar@dealer.kz",
                "address": "Pavlodar, Kairbaev 30",
                "region": "Pavlodar",
            },
        ]

        hq_org = None
        for org_data in organizations:
            existing = db.query(Organization).filter(Organization.name == org_data["name"]).first()
            if not existing:
                org = Organization(**org_data)
                db.add(org)
                db.flush()
                if org_data["name"] == "MoozTau HQ":
                    hq_org = org
                print(f"  Created organization: {org_data['name']}")
            else:
                if org_data["name"] == "MoozTau HQ":
                    hq_org = existing
                print(f"  Organization already exists: {org_data['name']}")

        # ── Super Admin ───────────────────────────────────────────────────
        admin_phone = "+77000000001"
        existing_admin = db.query(User).filter(User.phone == admin_phone).first()
        if not existing_admin:
            admin = User(
                organization_id=hq_org.id if hq_org else None,
                role=UserRole.SUPER_ADMIN.value,
                full_name="Super Admin",
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
