import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const db = {
    createUser: (id: bigint) => prisma.discordUser.create({ data: { id } }),
    getUser: (id: bigint) => prisma.discordUser.findUnique({ where: { id } }),
    getUserCharacters: (id: bigint) => prisma.character.findMany({ where: { ownerId: id } }),

    createFreeCompany: (id: bigint, name: string) => prisma.freeCompany.create({ data: { id, name } }),
    getFreeCompany: (id: bigint) => prisma.freeCompany.findUnique({ where: { id } }),
    getFreeCompanyCharacters: (id: bigint) => prisma.character.findMany({ where: { freeCompanyId: id } }),

    createCharacter: (id: bigint, name: string, ownerId: bigint, freeCompanyId: bigint) =>
        prisma.character.create({ data: { id, name, ownerId, freeCompanyId } }),
    getCharacter: (id: bigint) => prisma.character.findUnique({ where: { id } }),
    setCharacterOwner: (characterId: bigint, ownerId: bigint) =>
        prisma.character.update({ where: { id: characterId }, data: { ownerId } }),
    setCharacterFreeCompany: (characterId: bigint, freeCompanyId: bigint) =>
        prisma.character.update({ where: { id: characterId }, data: { freeCompanyId } }),

    disconnect: () => prisma.$disconnect(),
};
