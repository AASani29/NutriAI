import { resourcesRepository } from "./resources-repository";

const getAllResources = async () => {
    const resources = await resourcesRepository.getAllResources();
    return resources;
};

const getAllResourceTags = async () => {
    const tags = await resourcesRepository.getAllResourceTags();
    return tags;
};

const getResourceById = async (id: string) => {
    const resource = await resourcesRepository.getResourceById(id);
    return resource;
};

export const resourcesService = {
    getAllResources,
    getAllResourceTags,
    getResourceById,
};