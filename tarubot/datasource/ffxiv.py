import asyncio
from box import Box
from typing import List
import aiohttp
import concurrent.futures


async def get_character_by_id(lodestone_id: int):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nodestone:8080/character/{lodestone_id}"
        ) as response:
            if response.status != 200:
                return None

            return Box((await response.json())["Character"])


async def search_character_by_name(
    first_name: str, last_name: str, server: str, _page: int = 1
):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nodestone:8080/character/search?name={first_name}+{last_name}&server={server}&page={_page}"
        ) as response:
            if response.status != 200:
                return None

            results_data = await response.json()

            results: List[Box] = [Box(result) for result in results_data["List"]]

            if len(results) == 0:
                return None

            pagination = results_data["Pagination"]

            if pagination["PageNext"] == None:
                return results

            if _page == 1:
                tasks = [
                    search_character_by_name(first_name, last_name, server, p)
                    for p in range(2, pagination["PageTotal"] + 1)
                ]

                additional_results = await asyncio.gather(*tasks)

                for res in additional_results:
                    if res:
                        results.extend(res)

            return results
