from tortoise import fields, Tortoise, connections
from tortoise.models import Model
import os


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
        "models.FreeCompany", related_name="members", null=True
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
    await connections.get("default").execute_query("SELECT 1")


async def init():
    if Tortoise.apps:
        return

    db_url = "{driver}://{user}:{password}@{host}:{port}/{database}".format(
        **{
            k.lower(): os.environ.get("DB_" + k)
            for k in ("DRIVER", "USER", "PASSWORD", "HOST", "PORT", "DATABASE")
        }
    )

    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["tarubot.lib.db.db"]},
    )

    await Tortoise.generate_schemas(safe=True)
