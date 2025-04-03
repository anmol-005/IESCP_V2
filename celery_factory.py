'''from celery import Celery, Task
from flask import Flask
from app import app

class CeleryConfig():
    broker_url = 'redis://localhost:6379/0'
    result_backend = 'redis://localhost:6379/1'
    timezone = 'Asia/Kolkata'

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)
            
    

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(CeleryConfig)

    celery_app.autodiscover_tasks(['tasks'], force=True)

    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app'''

import os
from celery import Celery, Task
from flask import Flask

class CeleryConfig:
    broker_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    result_backend = os.getenv("REDIS_URL", "redis://localhost:6379/1")
    timezone = 'Asia/Kolkata'

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(CeleryConfig)

    celery_app.autodiscover_tasks(['tasks'], force=True)  # Ensure your tasks are in a 'tasks' module

    app.extensions["celery"] = celery_app
    return celery_app



