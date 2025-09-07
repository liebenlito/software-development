from sqlalchemy import inspect
from db.session import engine

insp = inspect(engine)
cols = insp.get_columns("datasets", schema="public")
print([ (c["name"], c["type"], c.get("nullable")) for c in cols ])