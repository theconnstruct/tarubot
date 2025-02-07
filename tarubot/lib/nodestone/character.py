from typing import Union

import aiohttp


async def get_character_by_id(character_id: int) -> Union[dict, None]:
    async with aiohttp.ClientSession() as session:
        with session.get(f'http://nodestone:8080/Character/{character_id}') as response:
            if response.status == 200:
                return await response.json()['Character']
