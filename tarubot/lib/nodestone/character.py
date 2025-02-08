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
    """
    Asynchronously retrieves character data for a given character ID from the Nodestone API.

    This function performs an HTTP GET request to the Nodestone API. If the request is successful
    (i.e., returns a status code of 200), the function extracts and returns the character
    information from the returned JSON data. If the request fails or the character data is not
    found, the function returns None.

    Parameters:
        character_id (int): The unique identifier of the character to be retrieved.

    Returns:
        Union[dict, None]: A dictionary containing the character data if the request is successful;
                           otherwise, None.
    """

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://nodestone:8080/Character/{character_id}"
        ) as response:
            if response.status == 200:
                response_data = await response.json()
                return response_data["Character"]
