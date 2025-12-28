import { resourcesRepository } from "./resources-repository";
import { recommendationService } from "../../services/recommendation-service";

interface CreateResourceDTO {
    title: string;
    description?: string;
    url?: string;
    type: 'Article' | 'Video';
    tags?: string[];
    isPublic?: boolean;
}

interface UpdateResourceDTO {
    title?: string;
    description?: string;
    url?: string;
    tags?: string[];
    isPublic?: boolean;
}

const getAllResources = async (userId?: string) => {
    const resources = await resourcesRepository.getAllResources(userId);
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

const getPersonalizedRecommendations = async (userId: string) => {
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
    return recommendations;
};

const createResource = async (userId: string, data: CreateResourceDTO) => {
    return await resourcesRepository.createResource(userId, data);
};

const updateResource = async (userId: string, resourceId: string, data: UpdateResourceDTO) => {
    return await resourcesRepository.updateResource(userId, resourceId, data);
};

const deleteResource = async (userId: string, resourceId: string) => {
    return await resourcesRepository.deleteResource(userId, resourceId);
};

export const resourcesService = {
    getAllResources,
    getAllResourceTags,
    getResourceById,
    getPersonalizedRecommendations,
    createResource,
    updateResource,
    deleteResource,
};