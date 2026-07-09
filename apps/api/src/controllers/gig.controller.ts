import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { GigDraft } from '../models/GigDraft.js';
import { CreateGigDraftSchema } from '@gigcraft-ai/shared';

// Get all gigs for user
export const getGigs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const drafts = await GigDraft.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(drafts);
  } catch (error) {
    console.error('getGigs error:', error);
    res.status(500).json({ error: 'Failed to retrieve gig drafts.' });
  }
};

// Create a new empty or partially filled draft
export const createGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = CreateGigDraftSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid gig data' });
      return;
    }

    const newDraft = new GigDraft({
      userId,
      ...parseResult.data,
      status: 'draft',
      version: 1
    });

    await newDraft.save();
    res.status(201).json(newDraft);
  } catch (error) {
    console.error('createGig error:', error);
    res.status(500).json({ error: 'Failed to create gig draft.' });
  }
};

// Get single gig draft
export const getGigById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const draft = await GigDraft.findById(id);
    if (!draft) {
      res.status(404).json({ error: 'Gig draft not found' });
      return;
    }

    if (draft.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden. You do not own this draft.' });
      return;
    }

    res.status(200).json(draft);
  } catch (error) {
    console.error('getGigById error:', error);
    res.status(500).json({ error: 'Failed to retrieve gig draft.' });
  }
};

// Patch/Update a gig draft
export const updateGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const draft = await GigDraft.findById(id);
    if (!draft) {
      res.status(404).json({ error: 'Gig draft not found' });
      return;
    }

    if (draft.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden. You do not own this draft.' });
      return;
    }

    // We can update details, including generatedContent from editing
    const allowedFields = [
      'serviceType',
      'rawDescription',
      'technologies',
      'targetBuyer',
      'experienceLevel',
      'pricingPreference',
      'researchData',
      'generatedContent',
      'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (draft as any)[field] = req.body[field];
      }
    }

    draft.version += 1;
    await draft.save();

    res.status(200).json(draft);
  } catch (error) {
    console.error('updateGig error:', error);
    res.status(500).json({ error: 'Failed to update gig draft.' });
  }
};

// Delete a gig draft
export const deleteGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const draft = await GigDraft.findById(id);
    if (!draft) {
      res.status(404).json({ error: 'Gig draft not found' });
      return;
    }

    if (draft.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden. You do not own this draft.' });
      return;
    }

    await GigDraft.findByIdAndDelete(id);
    res.status(200).json({ message: 'Gig draft deleted successfully.' });
  } catch (error) {
    console.error('deleteGig error:', error);
    res.status(500).json({ error: 'Failed to delete gig draft.' });
  }
};
