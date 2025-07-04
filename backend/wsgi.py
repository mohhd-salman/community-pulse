from app import create_app
from flask_migrate import upgrade
from seeder import seed_admin

app = create_app()

def run_setup():
    with app.app_context():
        upgrade()
        try:
            seed_admin()
        except Exception as e:
            import logging
            logging.warning(f"Seeder failed (maybe table doesn't exist yet): {e}")

run_setup()
