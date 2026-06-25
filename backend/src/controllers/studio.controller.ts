import { Request, Response } from 'express';
import { StudioService } from '../services/StudioService';

export const getActiveStudios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const studios = await StudioService.getActiveStudios();
    res.status(200).json(studios);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid studio ID' });
      return;
    }
    const studio = await StudioService.getStudioById(id);
    res.status(200).json(studio);
  } catch (error: any) {
    if (error.message === 'Studio not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid studio ID' });
      return;
    }
    const studio = await StudioService.updateStudio(id, req.body);
    res.status(200).json(studio);
  } catch (error: any) {
    if (error.message === 'Studio not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Admin Controllers ---

export const getAllStudiosAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const studios = await StudioService.getAllStudiosAdmin();
    res.status(200).json(studios);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const studio = await StudioService.createStudio(req.body);
    res.status(201).json(studio);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteStudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid studio ID' });
      return;
    }
    await StudioService.deleteStudio(id as string);
    res.status(200).json({ success: true, message: 'Studio deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
