import asyncio
from box import Box
from typing import Dict, List, Optional
import aiohttp


api_base_url = "http://nodestone:8080"


async def get_character_by_id(lodestone_id: int) -> Optional[Box]:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{api_base_url}/character/{lodestone_id}") as response:
            if response.status != 200:
                return None

            return Box((await response.json())["Character"])


async def search_character_by_name(
    first_name: str, last_name: str, world: str, _page: Optional[int] = 1
) -> Optional[List[Box]]:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{api_base_url}/character/search",
            params={
                "name": f"{first_name} {last_name}",
                "server": world,
                "page": _page,
            },
        ) as response:
            if response.status != 200:
                return None

            results_data: Dict = await response.json()

            if not results_data.get("List"):
                return None

            results = [Box(result) for result in results_data["List"]]

            pagination = results_data.get("Pagination")

            if not pagination or pagination["PageNext"] is None:
                return results

            if _page == 1:
                tasks = [
                    session.get(
                        f"{api_base_url}/character/search",
                        params={
                            "name": f"{first_name} {last_name}",
                            "server": world,
                            "page": p,
                        },
                    )
                    for p in range(2, pagination["PageTotal"] + 1)
                ]

                responses = await asyncio.gather(*tasks)

                for response in responses:
                    if response.status == 200:
                        additional_results_data = await response.json()

                        if "List" not in additional_results_data:
                            continue

                        additional_results = [
                            Box(result) for result in additional_results_data["List"]
                        ]

                        results.extend(additional_results)

            return results


async def get_fc_members_by_id(
    fc_id: int, _page: Optional[int] = 1
) -> Optional[List[Box]]:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{api_base_url}/freecompany/{fc_id}", params={"data": "FCM", "page": _page}
        ) as response:
            if response.status != 200:
                return None

            results_data: Dict = await response.json()

            if "FreeCompanyMembers" not in results_data:
                return None

            members = [Box(member) for member in results_data["FreeCompanyMembers"]]

            pagination = results_data.get("Pagination")

            if not pagination or pagination["PageNext"] is None:
                return members

            if _page == 1:
                tasks = [
                    session.get(
                        f"{api_base_url}/freecompany/{fc_id}",
                        params={"data": "FCM", "page": p},
                    )
                    for p in range(2, pagination["PageTotal"] + 1)
                ]

                responses = await asyncio.gather(*tasks)

                for response in responses:
                    if response.status != 200:
                        continue

                    additional_results_data = await response.json()

                    if "FreeCompanyMembers" not in additional_results_data:
                        continue

                    additional_members = [
                        Box(member)
                        for member in additional_results_data["FreeCompanyMembers"]
                    ]

                    members.extend(additional_members)

            return members
