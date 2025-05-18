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
        create: (id: bigint, name: string) => prisma.freeCompany.create({ data: { id, name } }),

        /**
         * Retrieves a Free Company from the database by its ID.
         * @param id The Free Company's ID.
         * @returns A promise that resolves to the Free Company or null if not found.
         */
        get: (id: bigint) => prisma.freeCompany.findUnique({ where: { id } }),

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
        create: (id: bigint, name: string, ownerId: bigint, freeCompanyId: bigint | null) =>
            prisma.character.create({ data: { id, name, ownerId, ...(freeCompanyId !== null ? { freeCompanyId } : {}) } }),

        /**
         * Retrieves a character from the database by its ID.
         * @param id The character's ID.
         * @returns A promise that resolves to the character or null if not found.
         */
        get: (id: bigint) => prisma.character.findUnique({ where: { id } }),

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
    },

    /**
     * Disconnects the Prisma client from the database.
     * @returns A promise that resolves when the client is disconnected.
     */
    disconnect: () => prisma.$disconnect(),
};
