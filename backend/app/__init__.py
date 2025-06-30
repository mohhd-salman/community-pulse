from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, migrate
from .routes.auth import auth_bp
from .routes.post import post_bp
# from .routes.vote import vote_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(post_bp, url_prefix="/api/posts")
    # app.register_blueprint(vote_bp, url_prefix="/api/votes")

    return app
