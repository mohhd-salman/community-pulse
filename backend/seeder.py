import os
import logging
from app.models import User
from app.extensions import db

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def seed_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        logger.info("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seeding.")
        return

    existing = User.query.filter_by(email=admin_email).first()
    if not existing:
        admin = User(email=admin_email, is_admin=True)
        admin.set_password(admin_password)
        db.session.add(admin)
        db.session.commit()
        logger.info(f"✅ Admin user created: {admin_email}")
    else:
        logger.info(f"✅ Admin user already exists: {admin_email}")
