#  Copyright (C) 2025 Connor Maddox
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program. If not, see <https://www.gnu.org/licenses/>.

from typing import Union

import aiohttp


async def get_character_by_id(character_id: int) -> Union[dict, None]:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nodestone:8080/Character/{character_id}"
        ) as response:
            if response.status == 200:
                response_data = await response.json()
                return response_data["Character"]
