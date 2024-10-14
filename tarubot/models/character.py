from sqlalchemy import BigInteger, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True)
    member_id = Column(BigInteger, ForeignKey("members.id"))
    fc_id = Column(Integer)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    server = Column(String, nullable=False)
    member = relationship("Member", back_populates="characters")
