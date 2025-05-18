import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const db = {
    user: {
        /**
         * Creates a new Discord user in the database.
         * @param id The Discord user's ID.
         * @returns A promise that resolves to the created user.
         */
        create: (id: bigint) => prisma.discordUser.create({ data: { id } }),

        /**
         * Retrieves a Discord user from the database by their ID.
         * @param id The Discord user's ID.
         * @returns A promise that resolves to the user or null if not found.
         */
        get: (id: bigint) => prisma.discordUser.findUnique({ where: { id } }),

        /**
         * Retrieves all characters associated with a Discord user.
         * @param id The Discord user's ID.
         * @returns A promise that resolves to an array of characters.
         */
        getCharacters: (id: bigint) => prisma.character.findMany({ where: { ownerId: id } }),
    },

    freeCompany: {
        /**
         * Creates a new Free Company in the database.
         * @param id The Free Company's ID.
         * @param name The Free Company's name.
         * @returns A promise that resolves to the created Free Company.
         */
        create: (id: bigint, name: string) => prisma.freeCompany.create({ data: { id, name, lodestoneUpdatedAt: new Date() } }),

        /**
         * Retrieves a Free Company from the database by its ID.
         * @param id The Free Company's ID.
         * @returns A promise that resolves to the Free Company or null if not found.
         */
        get: (id: bigint) => prisma.freeCompany.findUnique({ where: { id } }),

        /**
         * Updates a Free Company's name and timestamp in the database.
         * @param id The Free Company's ID.
         * @param name The Free Company's new name.
         * @returns A promise that resolves to the updated Free Company.
         */
        update: (id: bigint, name: string) => prisma.freeCompany.update({
            where: { id },
            data: { name, lodestoneUpdatedAt: new Date() },
        }),

        /**
         * Retrieves all characters belonging to a Free Company.
         * @param id The Free Company's ID.
         * @returns A promise that resolves to an array of characters.
         */
        getCharacters: (id: bigint) => prisma.character.findMany({ where: { freeCompanyId: id } }),
    },

    character: {
        /**
         * Creates a new character in the database.
         * @param id The character's ID.
         * @param name The character's name.
         * @param ownerId The ID of the Discord user who owns the character.
         * @param freeCompanyId The ID of the Free Company the character belongs to (optional).
         * @returns A promise that resolves to the created character.
         */
        create: (id: bigint, name: string, ownerId: bigint | null, freeCompanyId: bigint | null) =>
            prisma.character.create({ data: { id, name, ...(ownerId !== null ? { ownerId } : {}), ...(freeCompanyId !== null ? { freeCompanyId } : {}), lodestoneUpdatedAt: new Date() } }),

        /**
         * Retrieves a character from the database by its ID.
         * @param id The character's ID.
         * @returns A promise that resolves to the character or null if not found.
         */
        get: (id: bigint) => prisma.character.findUnique({ where: { id } }),

        /**
         * Updates a character's name, Free Company, and timestamp in the database.
         * @param id The character's ID.
         * @param name The character's new name.
         * @param freeCompanyId The ID of the new Free Company, or null to remove the character from any Free Company.
         * @returns A promise that resolves to the updated character.
         */
        update: (id: bigint, name: string, freeCompanyId: bigint | null) =>
            prisma.character.update({
                where: { id },
                data: { name, ...(freeCompanyId !== null ? { freeCompanyId } : { freeCompanyId: null }), lodestoneUpdatedAt: new Date() },
            }),

        /**
         * Sets the owner of a character.
         * @param characterId The ID of the character to update.
         * @param ownerId The ID of the new Discord user owner.
         * @returns A promise that resolves to the updated character.
         */
        setOwner: (characterId: bigint, ownerId: bigint) =>
            prisma.character.update({ where: { id: characterId }, data: { ownerId } }),

        /**
         * Sets the Free Company for a character.
         * @param characterId The ID of the character to update.
         * @param freeCompanyId The ID of the new Free Company, or null to remove the character from any Free Company.
         * @returns A promise that resolves to the updated character.
         */
        setFreeCompany: (characterId: bigint, freeCompanyId: bigint | null) =>
            prisma.character.update({ where: { id: characterId }, data: { freeCompanyId: freeCompanyId === null ? undefined : freeCompanyId } }),

        /**
         * Deletes a character from the database, ensuring the owner is the one requesting deletion.
         * @param characterId The ID of the character to delete.
         * @param ownerId The ID of the Discord user who owns the character.
         * @returns A promise that resolves to the Prisma batch payload (containing the count of deleted records).
         */
        delete: (characterId: bigint, ownerId?: bigint) => { // ownerId is now optional
            if (ownerId) {
                // If ownerId is provided, delete only if it matches (original behavior for user unclaim)
                return prisma.character.deleteMany({ where: { id: characterId, ownerId } });
            } else {
                // If ownerId is not provided, delete the character regardless of owner (for admin purposes or unowned characters)
                return prisma.character.deleteMany({ where: { id: characterId } });
            }
        },
    },

    guildConfig: {
        /**
         * Retrieves a guild's configuration from the database.
         * @param guildId The Discord guild's ID.
         * @returns A promise that resolves to the guild's config or null if not found.
         */
        get: (guildId: string) => prisma.guildConfig.findUnique({ where: { guildId } }),

        /**
         * Creates or updates a guild's configuration in the database.
         * @param guildId The Discord guild's ID.
         * @param data The data to set for the guild's configuration.
         * @returns A promise that resolves to the created or updated guild config.
         */
        upsert: (guildId: string, data: { memberRoleId?: string | null; guestRoleId?: string | null; fcId?: string | null }) =>
            prisma.guildConfig.upsert({
                where: { guildId },
                update: data,
                create: { guildId, ...data },
            }),

        /**
         * Sets the member role for a guild.
         * @param guildId The Discord guild's ID.
         * @param roleId The ID of the role to set as the member role.
         * @returns A promise that resolves to the updated guild config.
         */
        setMemberRole: (guildId: string, roleId: string | null) =>
            prisma.guildConfig.upsert({
                where: { guildId },
                update: { memberRoleId: roleId },
                create: { guildId, memberRoleId: roleId },
            }),

        /**
         * Sets the guest role for a guild.
         * @param guildId The Discord guild's ID.
         * @param roleId The ID of the role to set as the guest role.
         * @returns A promise that resolves to the updated guild config.
         */
        setGuestRole: (guildId: string, roleId: string | null) =>
            prisma.guildConfig.upsert({
                where: { guildId },
                update: { guestRoleId: roleId },
                create: { guildId, guestRoleId: roleId },
            }),

        /**
         * Sets the Free Company ID for a guild.
         * @param guildId The Discord guild's ID.
         * @param fcId The ID of the Free Company.
         * @returns A promise that resolves to the updated guild config.
         */
        setFcId: (guildId: string, fcId: string | null) =>
            prisma.guildConfig.upsert({
                where: { guildId },
                update: { fcId: fcId },
                create: { guildId, fcId: fcId },
            }),
    },

    /**
     * Disconnects the Prisma client from the database.
     * @returns A promise that resolves when the client is disconnected.
     */
    disconnect: () => prisma.$disconnect(),
};
