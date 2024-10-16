from ...datasource import search_character_by_name
from disnake import MessageInteraction, ModalInteraction
from disnake.ui import Modal, TextInput


class LobbyModal(Modal):
    def __init__(self, interaction: MessageInteraction):
        components = [
            TextInput(
                label="First Name",
                custom_id="first_name",
                placeholder="First Name",
                min_length=2,
                max_length=15,
            ),
            TextInput(
                label="Last Name",
                custom_id="last_name",
                placeholder="Last Name",
                min_length=2,
                max_length=15,
            ),
            TextInput(
                label="Server",
                custom_id="server",
                placeholder="Server",
                max_length=32,
            ),
        ]

        super().__init__(
            title="Character Information",
            custom_id=f"lobby_modal-{interaction.message.id}",
            components=components,
        )

    async def callback(self, interaction: ModalInteraction):
        await interaction.response.defer(ephemeral=True)

        search_results = await search_character_by_name(
            interaction.text_values["first_name"],
            interaction.text_values["last_name"],
            interaction.text_values["server"],
        )

        if not search_results:
            await interaction.send(
                "No character found with the provided information. Please try again."
            )
            return

        if len(search_results) > 1:
            await interaction.send(
                "Multiple characters found with the provided information. Please narrow down your search."
            )
            return

        await interaction.send(
            f"You have been granted access to the server.\n\nIf this were real, I would have changed your nickname to `{search_results[0].Name}`.",
            ephemeral=True,
        )
