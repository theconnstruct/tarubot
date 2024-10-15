import aiohttp
from box import Box


async def get_character_by_id(lodestone_id: int):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nodestone:8080/character/{lodestone_id}"
        ) as response:
            if response.status != 200:
                return None

            return Box((await response.json())["Character"])
