import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { GigDraft } from '../models/GigDraft.js';
import { GenerationHistory } from '../models/GenerationHistory.js';
import { generateGigContent, regenerateSection } from '../ai/deepseek.service.js';

// Deep-merges source object properties into target object
const mergeDeep = (target: any, source: any) => {
  if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
    return source;
  }
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Array) {
      target[key] = source[key];
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      target[key] = mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

// POST /api/ai/generate-gig
export const generateGig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { gigDraftId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!gigDraftId) {
      res.status(400).json({ error: 'gigDraftId is required' });
      return;
    }

    const draft = await GigDraft.findById(gigDraftId);
    if (!draft) {
      res.status(404).json({ error: 'Gig draft not found' });
      return;
    }

    if (draft.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden. You do not own this draft.' });
      return;
    }

    // Call DeepSeek API
    const generatedContent = await generateGigContent(
      draft.serviceType,
      draft.rawDescription,
      draft.technologies,
      draft.targetBuyer,
      draft.experienceLevel,
      draft.pricingPreference,
      draft.researchData
    );

    // Save to database
    draft.generatedContent = generatedContent;
    draft.status = 'completed';
    draft.version += 1;
    await draft.save();

    // Log to history
    const historyEntry = new GenerationHistory({
      userId,
      gigDraftId: draft._id,
      generationType: 'full_generation',
      input: {
        serviceType: draft.serviceType,
        rawDescription: draft.rawDescription,
        technologies: draft.technologies,
        targetBuyer: draft.targetBuyer,
        experienceLevel: draft.experienceLevel,
        pricingPreference: draft.pricingPreference,
        researchData: draft.researchData
      },
      output: generatedContent,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    });
    await historyEntry.save();

    res.status(200).json(draft);
  } catch (error) {
    console.error('generateGig error:', error);
    res.status(500).json({ error: `AI generation failed: ${(error as Error).message}` });
  }
};

// POST /api/ai/regenerate-section
export const regenerateGigSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { gigDraftId, sectionPath, instructions } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!gigDraftId || !sectionPath || !instructions) {
      res.status(400).json({ error: 'gigDraftId, sectionPath, and instructions are required' });
      return;
    }

    const draft = await GigDraft.findById(gigDraftId);
    if (!draft) {
      res.status(404).json({ error: 'Gig draft not found' });
      return;
    }

    if (draft.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden. You do not own this draft.' });
      return;
    }

    if (!draft.generatedContent) {
      res.status(400).json({ error: 'Gig draft has no generated content yet. Generate a full draft first.' });
      return;
    }

    // Call DeepSeek to modify this specific section
    const sectionResult = await regenerateSection(
      draft.generatedContent,
      sectionPath,
      instructions
    );

    // Apply regenerated section value back to draft.generatedContent
    // The sectionResult might look like { "gigTitle": "..." } or { "packages": { "basic": { ... } } }
    // We deep merge sectionResult into draft.generatedContent
    const mergedContent = mergeDeep(
      JSON.parse(JSON.stringify(draft.generatedContent)),
      sectionResult
    );

    draft.generatedContent = mergedContent;
    draft.version += 1;
    draft.markModified('generatedContent');
    await draft.save();

    // Log to history
    const historyEntry = new GenerationHistory({
      userId,
      gigDraftId: draft._id,
      generationType: 'section_regeneration',
      input: {
        sectionPath,
        instructions,
        originalContent: draft.generatedContent
      },
      output: sectionResult,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    });
    await historyEntry.save();

    res.status(200).json(draft);
  } catch (error) {
    console.error('regenerateGigSection error:', error);
    res.status(500).json({ error: `Section regeneration failed: ${(error as Error).message}` });
  }
};

// GET /api/history
export const getGenerationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const history = await GenerationHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json(history);
  } catch (error) {
    console.error('getGenerationHistory error:', error);
    res.status(500).json({ error: 'Failed to retrieve generation history.' });
  }
};
