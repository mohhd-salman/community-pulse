from app import create_app
from flask_migrate import upgrade
from seeder import seed_admin

app = create_app()

with app.app_context():
    upgrade()
    seed_admin()
