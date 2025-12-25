import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

const getAllResources = async () => {
    const resources = await prisma.resource.findMany({
        include: {
            tags: {
                select: {
                    tag: {
                        select: {
                            tag: true
                        }
                    },
                }
            }
        },
        orderBy: [
            { createdAt: 'desc' }
        ]
    });

    return resources.map(r => ({
        ...r,
        tags: r.tags.map(t => t.tag.tag)
    }));
};

const getAllResourceTags = async () => {
    return prisma.resourceTag.findMany({
        orderBy: [{ tag: 'asc' }]
    });
};

const getResourceById = async (id: string) => {
    return prisma.resource.findUnique({
        where: { id }
    });
};

export const resourcesRepository = {
    getAllResources,
    getAllResourceTags,
    getResourceById,
};