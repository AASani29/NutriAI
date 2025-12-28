import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

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
    const resources = await prisma.resource.findMany({
        where: {
            isDeleted: false,
            OR: [
                { isPublic: true },
                ...(userId ? [{ createdById: userId }] : [])
            ]
        },
        include: {
            tags: {
                select: {
                    tag: {
                        select: {
                            tag: true
                        }
                    },
                }
            },
            createdBy: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            fullName: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { createdAt: 'desc' }
        ]
    });

    return resources.map(r => ({
        ...r,
        tags: r.tags.map(t => t.tag.tag),
        createdBy: r.createdBy ? {
            id: r.createdBy.id,
            fullName: r.createdBy.profile?.fullName || 'Unknown'
        } : null
    }));
};

const getAllResourceTags = async () => {
    return prisma.resourceTag.findMany({
        where: { isDeleted: false },
        orderBy: [{ tag: 'asc' }]
    });
};

const getResourceById = async (id: string) => {
    return prisma.resource.findUnique({
        where: { id, isDeleted: false }
    });
};

const createResource = async (userId: string, data: CreateResourceDTO) => {
    const { tags, ...resourceData } = data;

    // Create or find tags
    const tagRecords = tags && tags.length > 0 ? await Promise.all(
        tags.map(async (tagName) => {
            const tag = await prisma.resourceTag.upsert({
                where: { tag: tagName },
                update: {},
                create: { tag: tagName }
            });
            return tag;
        })
    ) : [];

    // Create resource
    const resource = await prisma.resource.create({
        data: {
            ...resourceData,
            createdById: userId,
            isPublic: data.isPublic ?? true,
            tags: {
                create: tagRecords.map(tag => ({
                    tag: {
                        connect: { id: tag.id }
                    }
                }))
            }
        },
        include: {
            tags: {
                select: {
                    tag: {
                        select: {
                            tag: true
                        }
                    }
                }
            }
        }
    });

    return {
        ...resource,
        tags: resource.tags.map(t => t.tag.tag)
    };
};

const updateResource = async (userId: string, resourceId: string, data: UpdateResourceDTO) => {
    // Check if resource exists and user owns it
    const existing = await prisma.resource.findUnique({
        where: { id: resourceId, isDeleted: false }
    });

    if (!existing) {
        throw new Error('Resource not found');
    }

    if (existing.createdById !== userId) {
        throw new Error('You are not authorized to update this resource');
    }

    const { tags, ...resourceData } = data;

    // If tags are provided, update them
    if (tags) {
        // Delete existing tag associations
        await prisma.resourceTagOnResource.deleteMany({
            where: { resourceId }
        });

        // Create or find new tags
        const tagRecords = await Promise.all(
            tags.map(async (tagName) => {
                const tag = await prisma.resourceTag.upsert({
                    where: { tag: tagName },
                    update: {},
                    create: { tag: tagName }
                });
                return tag;
            })
        );

        // Update resource with new tags
        const resource = await prisma.resource.update({
            where: { id: resourceId },
            data: {
                ...resourceData,
                tags: {
                    create: tagRecords.map(tag => ({
                        tag: {
                            connect: { id: tag.id }
                        }
                    }))
                }
            },
            include: {
                tags: {
                    select: {
                        tag: {
                            select: {
                                tag: true
                            }
                        }
                    }
                }
            }
        });

        return {
            ...resource,
            tags: resource.tags.map(t => t.tag.tag)
        };
    }

    // Update without tags
    const resource = await prisma.resource.update({
        where: { id: resourceId },
        data: resourceData,
        include: {
            tags: {
                select: {
                    tag: {
                        select: {
                            tag: true
                        }
                    }
                }
            }
        }
    });

    return {
        ...resource,
        tags: resource.tags.map(t => t.tag.tag)
    };
};

const deleteResource = async (userId: string, resourceId: string) => {
    // Check if resource exists and user owns it
    const existing = await prisma.resource.findUnique({
        where: { id: resourceId, isDeleted: false }
    });

    if (!existing) {
        throw new Error('Resource not found');
    }

    if (existing.createdById !== userId) {
        throw new Error('You are not authorized to delete this resource');
    }

    // Soft delete
    await prisma.resource.update({
        where: { id: resourceId },
        data: {
            isDeleted: true,
            deletedAt: new Date()
        }
    });
};

export const resourcesRepository = {
    getAllResources,
    getAllResourceTags,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
};