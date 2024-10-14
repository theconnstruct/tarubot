from sqlalchemy import Column, BigInteger, Integer
from sqlalchemy.orm import relationship
from . import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(BigInteger, primary_key=True, unique=True)
    primary_char_id = Column(Integer, nullable=True)
    characters = relationship("Character", back_populates="member")
