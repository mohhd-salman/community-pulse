from app import create_app
from seeder import seed_admin

app = create_app()

if __name__ == "__main__":
    seed_admin()
    app.run(debug=True)
