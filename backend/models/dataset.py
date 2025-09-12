from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from db.session import Base

class Dataset(Base):
    __tablename__ = "datasets"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    n_rows = Column(Integer, nullable=False, default=0)
    n_cols = Column(Integer, nullable=False, default=0)

    numeric_columns = Column(JSON, nullable=True)  # list of numeric cols
    stats = Column(JSON, nullable=True)  # dict: {col: {mean, median, std, min, max}}
    categorical_columns = Column(JSON, nullable=True) # dict: kolom kategori
    stored_csv = Column(Text, nullable=True) # path CSV asli
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    preview_rows = Column(JSON, nullable=True)
    
    raw_data = Column(JSON, nullable=True)