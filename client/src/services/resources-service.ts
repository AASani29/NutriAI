import { BASE_URL } from "./utils";

export const getAllResources = async () => {
    const res = await fetch(`${BASE_URL}/resources`);
    if (!res.ok) {
        throw new Error('Failed to fetch resources');
    }

    const data = await res.json();
    return data.data;
}