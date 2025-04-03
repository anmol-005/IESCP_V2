import os
from flask import Flask
import routes
import secrets
from extensions import db
from flask_security import Security, SQLAlchemyUserDatastore
from initial_data import create_initial_data
from models import User, Role
from flask_mail import Mail
from flask_caching import Cache


def create_app():
    app=Flask(__name__)
    
    app.config['SECRET_KEY'] = secrets.token_hex(16)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iescp.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECURITY_PASSWORD_SALT'] = secrets.token_hex(16)

    app.config.update(
    MAIL_SERVER='smtp.gmail.com',         
    MAIL_PORT=587,                        
    MAIL_USE_TLS=True,                    
    MAIL_USE_SSL=False,                   
    MAIL_USERNAME='jeeiit252@gmail.com', 
    MAIL_PASSWORD='fruo vnae tqls ppyl',       
    MAIL_DEFAULT_SENDER=('IESPC', 'jeeiit252@gmail.com'),
    MAIL_DEBUG=True 
    )  

    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_DEFAULT_TIMEOUT"] = 30
    app.config["CACHE_REDIS_PORT"] = 6379

    
    cache=Cache(app)
    app.cache=cache


    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security=Security(app,datastore=datastore)

    app.app_context().push()

    with app.app_context():
        db.create_all()
        create_initial_data(datastore)
    
    routes.create_routes(app)
    
    return app

app=create_app()

mail = Mail(app)

if __name__ == "__main__": 
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
