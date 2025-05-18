import axios from 'axios';
import { db } from './db'; // Import the db service

const NODESTONE_URL = Bun.env.NODESTONE_URL;
const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

interface XIVAPICharacterData {
    ID: number;
    Name: string;
    World: string;
    FreeCompany: { ID: number;[key: string]: any } | null;
    [key: string]: any;
}

interface XIVAPICharacterResponse {
    Character: XIVAPICharacterData;
}

interface XIVAPISearchResultItem {
    ID: number;
    Name: string;
    World: string;
    [key: string]: any;
}

interface XIVAPICharacterSearchResponse {
    List: XIVAPISearchResultItem[];
    Pagination: XIVAPIPagination;
}

interface XIVAPIFreeCompanyData {
    ID: number;
    Name: string;
    World: string;
    [key: string]: any;
}

interface XIVAPIFreeCompanyResponse {
    FreeCompany: XIVAPIFreeCompanyData;
}

interface XIVAPIFreeCompanyMemberItem {
    ID: number;
    Name: string;
    World: string;
    [key: string]: any;
}

interface XIVAPIFreeCompanyMembersResponse {
    FreeCompanyMembers: {
        List: XIVAPIFreeCompanyMemberItem[];
    };
    Pagination: XIVAPIPagination;
}

interface XIVAPIPagination {
    Page: number;
    PageNext: number | null;
    PageTotal: number;
    [key: string]: any;
}

export interface Character {
    ID: string;
    Name: string;
    World: string;
    FreeCompanyID: string | null;
}

export interface SimpleCharacter {
    ID: string;
    Name: string;
    World: string;
}

export interface FreeCompany {
    ID: string;
    Name: string;
    World: string;
}

export interface FreeCompanyMember {
    ID: string;
    Name: string;
    World: string;
}
async function fetchData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
        const fullUrl = `${NODESTONE_URL}/${endpoint}`;
        const response = await axios.get<T>(fullUrl, { params });
        return response.data;
    } catch (error) {
        const queryParams = params ? ` with params ${JSON.stringify(params)}` : '';
        console.error(`Error fetching data from ${NODESTONE_URL}/${endpoint}${queryParams}:`, error);
        throw error;
    }
}

export async function getCharacterById(id: string): Promise<Character> {
    const characterIdBigInt = BigInt(id);
    const dbCharacter = await db.character.get(characterIdBigInt);

    if (dbCharacter && dbCharacter.lodestoneUpdatedAt && (new Date().getTime() - dbCharacter.lodestoneUpdatedAt.getTime()) < SIX_HOURS_IN_MS) {
        // Data is fresh enough, return from DB
        return {
            ID: String(dbCharacter.id),
            Name: dbCharacter.name,
            World: 'Unknown World', // Placeholder, as World is not stored in Character model directly
            FreeCompanyID: dbCharacter.freeCompanyId ? String(dbCharacter.freeCompanyId) : null,
        };
    }

    // Data is stale or not in DB, fetch from Lodestone
    const rawData = await fetchData<XIVAPICharacterResponse>(`character/${id}`);
    if (!rawData || !rawData.Character) {
        throw new Error(`Invalid character data received for ID ${id}`);
    }
    const charData = rawData.Character;

    // Update DB with fresh data
    await db.character.update(characterIdBigInt, charData.Name, charData.FreeCompany && charData.FreeCompany.ID ? BigInt(charData.FreeCompany.ID) : null);

    return {
        ID: String(charData.ID),
        Name: charData.Name,
        World: charData.World || 'Unknown World',
        FreeCompanyID: charData.FreeCompany && charData.FreeCompany.ID ? String(charData.FreeCompany.ID) : null,
    };
}

export async function searchCharacter(firstName: string, lastName: string, world: string): Promise<SimpleCharacter[]> {
    const allCharacters: SimpleCharacter[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
        const params: Record<string, any> = {
            name: `${firstName} ${lastName}`,
            server: world,
            page: currentPage,
        };
        const responseData = await fetchData<XIVAPICharacterSearchResponse>('character/search', params);

        if (!responseData || !responseData.List) {
            break;
        }

        responseData.List.forEach(item => {
            allCharacters.push({
                ID: String(item.ID),
                Name: item.Name,
                World: item.World || 'Unknown World',
            });
        });

        if (responseData.Pagination) {
            totalPages = responseData.Pagination.PageTotal;
            if (responseData.Pagination.PageNext && responseData.Pagination.PageNext > 0 && responseData.Pagination.PageNext <= totalPages) {
                currentPage = responseData.Pagination.PageNext;
            } else {
                currentPage = totalPages + 1;
            }
        } else {
            break;
        }
    } while (currentPage <= totalPages);

    return allCharacters;
}

export async function getFreeCompanyById(id: string): Promise<FreeCompany> {
    const fcIdBigInt = BigInt(id);
    const dbFc = await db.freeCompany.get(fcIdBigInt);

    if (dbFc && dbFc.lodestoneUpdatedAt && (new Date().getTime() - dbFc.lodestoneUpdatedAt.getTime()) < SIX_HOURS_IN_MS) {
        // Data is fresh enough, return from DB
        return {
            ID: String(dbFc.id),
            Name: dbFc.name,
            World: 'Unknown World', // Placeholder, as World is not stored in FreeCompany model directly
        };
    }

    // Data is stale or not in DB, fetch from Lodestone
    const rawData = await fetchData<XIVAPIFreeCompanyResponse>(`freecompany/${id}`);
    if (!rawData || !rawData.FreeCompany) {
        throw new Error(`Invalid Free Company data received for ID ${id}`);
    }
    const fcData = rawData.FreeCompany;

    // Update DB with fresh data
    await db.freeCompany.update(fcIdBigInt, fcData.Name);

    return {
        ID: String(fcData.ID),
        Name: fcData.Name,
        World: fcData.World || 'Unknown World',
    };
}

export async function getFreeCompanyMembersById(id: string): Promise<FreeCompanyMember[]> {
    const allMembers: FreeCompanyMember[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
        const endpoint = `freecompany/${id}`;
        const params: Record<string, any> = {
            data: 'FCM',
            page: currentPage,
        };

        const responseData = await fetchData<XIVAPIFreeCompanyMembersResponse>(endpoint, params);

        const memberList = responseData.FreeCompanyMembers.List;

        if (!memberList) {
            break;
        }

        memberList.forEach(item => {
            allMembers.push({
                ID: String(item.ID),
                Name: item.Name,
                World: item.World || 'Unknown World',
            });
        });

        if (responseData.Pagination) {
            totalPages = responseData.Pagination.PageTotal;
            if (responseData.Pagination.PageNext && responseData.Pagination.PageNext > 0 && responseData.Pagination.PageNext <= totalPages) {
                currentPage = responseData.Pagination.PageNext;
            } else {
                currentPage = totalPages + 1;
            }
        } else {
            break;
        }
    } while (currentPage <= totalPages);

    return allMembers;
}
