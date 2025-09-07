from db.session import engine, Base
from models.dataset import Dataset
from sqlalchemy.engine.url import make_url

print("Creating tables on:", str(make_url(str(engine.url)).set(password="statsecret")))
Base.metadata.create_all(bind=engine)
print("Done.")