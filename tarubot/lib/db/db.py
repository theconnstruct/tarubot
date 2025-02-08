from tortoise import fields, Tortoise, connections
from tortoise.models import Model
import os

db_connected = False


class DiscordUser(Model):
    id = fields.BigIntField(pk=True)

    def __repr__(self):
        return f"<DiscordUser(id={self.id})>"

    class Meta:  # type: ignore
        table = "discord_users"


class FreeCompany(Model):
    id = fields.BigIntField(pk=True)
    world = fields.CharField(max_length=20)

    def __repr__(self):
        return f"<FreeCompany(id={self.id}, world={self.world!r})>"

    class Meta:  # type: ignore
        table = "free_companies"


class GameCharacter(Model):
    id = fields.BigIntField(pk=True)
    forename = fields.CharField(max_length=15)
    surname = fields.CharField(max_length=15)
    world = fields.CharField(max_length=20)
    owner: fields.ForeignKeyRelation[DiscordUser] = fields.ForeignKeyField(
        "models.DiscordUser", related_name="characters"
    )
    fc: fields.ForeignKeyNullableRelation[FreeCompany] = fields.ForeignKeyField(
        "models.FreeCompany", related_name="members"
    )

    def __repr__(self):
        return (
            f"<GameCharacter(id={self.id}, forename={self.forename!r}, "
            f"surname={self.surname!r}, world={self.world!r}, "
            f"owner_id={self.owner.id}, fc_id={self.fc.id if self.fc else None})>"
        )

    class Meta:  # type: ignore
        table = "game_characters"


async def test_db():
    if not db_connected:
        await init()

    await connections.get("default").execute_query("SELECT 1")


async def init():
    db_connection_data = {
        "connections": {
            "default": {
                "engine": "tortoise.backends.asyncpg",
                "credentials": {
                    "ssl": "verify-full",
                },
            },
        }
    }

    db_connection_data["connections"]["default"]["credentials"] = {
        key.lower(): os.environ.get(f"DB_{key}")
        for key in ["HOST", "PORT", "USER", "PASSWORD", "DATABASE"]
    }

    await Tortoise.init(config=db_connection_data)
    await Tortoise.generate_schemas(safe=True)
    global db_connected
    db_connected = True
