import { Request, Response } from 'express';
import { resourcesService } from './resources-service';

export const getAllResources = async (req: Request, res: Response) => {
  try {
    const resources = await resourcesService.getAllResources();
    res.json({ message: "Retrieved resources successfully", data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      message: 'Error fetching resources',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllResourceTags = async (req: Request, res: Response) => {
  try {
    const tags = await resourcesService.getAllResourceTags();
    res.json({ message: "Retrieved resource tags successfully", data: tags });
  } catch (error) {
    console.error('Error fetching resource tags:', error);
    res.status(500).json({
      message: 'Error fetching resource tags',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await resourcesService.getResourceById(id);
    if (!resource) {
      return res.status(404).json({ message: `Resource with id ${id} not found` });
    }
    res.json({ message: `Retrieved resource ${id} successfully`, data: resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      message: 'Error fetching resource',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const resourcesController = {
    getAllResources,
    getAllResourceTags,
    getResourceById,
};