import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ArrowLeft, ArrowRight, Sparkles, Check, X, ShieldAlert, Cpu } from 'lucide-react';

interface WizardProps {
  onNavigate: (screen: string) => void;
  selectedDraftId: string | null;
  onSelectDraft: (id: string | null) => void;
  prepopulatedTemplate: any | null;
  clearTemplate: () => void;
  showToast: (text: string, type: 'success' | 'warning' | 'error') => void;
}

export const Wizard: React.FC<WizardProps> = ({
  onNavigate,
  selectedDraftId,
  onSelectDraft,
  prepopulatedTemplate,
  clearTemplate,
  showToast
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('Initializing AI engine...');

  // Form Fields - Step 1
  const [serviceType, setServiceType] = useState('Full Stack Development');
  const [rawDescription, setRawDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [targetBuyer, setTargetBuyer] = useState('SaaS company');
  const [experienceLevel, setExperienceLevel] = useState('Expert');
  const [pricingPreference, setPricingPreference] = useState('Competitive');
  const [instructions, setInstructions] = useState('');

  // Form Fields - Step 2 (Research/Competitor Data)
  const [competitorTitles, setCompetitorTitles] = useState('');
  const [competitorPricing, setCompetitorPricing] = useState('');
  const [commonKeywords, setCommonKeywords] = useState('');
  const [popularTags, setPopularTags] = useState('');
  const [competitorDescriptions, setCompetitorDescriptions] = useState('');
  const [marketObservations, setMarketObservations] = useState('');

  // Prepopulate if template selected
  useEffect(() => {
    if (prepopulatedTemplate) {
      setServiceType(prepopulatedTemplate.serviceType);
      setRawDescription(prepopulatedTemplate.rawDescription);
      setTechnologies(prepopulatedTemplate.technologies);
      setTargetBuyer(prepopulatedTemplate.targetBuyer);
      setExperienceLevel(prepopulatedTemplate.experienceLevel);
      setPricingPreference(prepopulatedTemplate.pricingPreference);
      clearTemplate();
    }
  }, [prepopulatedTemplate]);

  // Load existing draft if editing
  useEffect(() => {
    const loadDraft = async () => {
      if (!selectedDraftId) return;
      try {
        const draft = await api.getGigById(selectedDraftId);
        setServiceType(draft.serviceType);
        setRawDescription(draft.rawDescription);
        setTechnologies(draft.technologies);
        setTargetBuyer(draft.targetBuyer);
        setExperienceLevel(draft.experienceLevel);
        setPricingPreference(draft.pricingPreference);
        if (draft.researchData) {
          setCompetitorTitles(draft.researchData.competitorTitles || '');
          setCompetitorPricing(draft.researchData.competitorPricing || '');
          setCommonKeywords(draft.researchData.commonKeywords || '');
          setPopularTags(draft.researchData.popularTags || '');
          setCompetitorDescriptions(draft.researchData.competitorDescriptions || '');
          setMarketObservations(draft.researchData.marketObservations || '');
        }
      } catch (err) {
        showToast('Error loading draft details.', 'error');
      }
    };
    loadDraft();
  }, [selectedDraftId]);

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = techInput.trim().replace(/,$/, '');
      if (tag && !technologies.includes(tag)) {
        setTechnologies([...technologies, tag]);
        setTechInput('');
      }
    }
  };

  const handleRemoveTech = (tag: string) => {
    setTechnologies(technologies.filter((t) => t !== tag));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!rawDescription.trim() || rawDescription.trim().length < 10) {
        showToast('Please describe your service in detail (min 10 chars).', 'warning');
        return;
      }
      if (technologies.length === 0) {
        showToast('Please add at least one technology tag.', 'warning');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onSelectDraft(null);
      onNavigate('dashboard');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep(3);

    const steps = [
      'Structuring pricing tiers...',
      'Optimizing SEO tag listings...',
      'Synthesizing competitor insights...',
      'Formatting full description flow...',
      'Drafting requirements and buyer FAQs...',
      'Validating JSON outputs against schemas...'
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < steps.length) {
        setGenStatus(steps[count]);
        count++;
      }
    }, 2500);

    try {
      const payload = {
        serviceType,
        rawDescription,
        technologies,
        targetBuyer,
        experienceLevel,
        pricingPreference,
        researchData: {
          competitorTitles,
          competitorPricing,
          commonKeywords,
          popularTags,
          competitorDescriptions,
          marketObservations
        }
      };

      let draftId = selectedDraftId;

      if (draftId) {
        // Update existing draft
        await api.updateGig(draftId, payload);
      } else {
        // Create new draft
        const draft = await api.createGig(payload);
        draftId = draft._id;
        onSelectDraft(draftId);
      }

      // Trigger AI generation
      const finalResult = await api.generateGig(draftId!);
      clearInterval(interval);
      showToast('Gig draft generated successfully!', 'success');
      onNavigate('results');
    } catch (err: any) {
      clearInterval(interval);
      showToast(err.message || 'AI generation failed.', 'error');
      setStep(2); // Go back to research step to let them retry
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shadow-sm shrink-0">
        <button
          onClick={handleBack}
          disabled={isGenerating}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">Back</span>
        </button>
        <span className="text-xs font-bold text-slate-800">
          {step === 3 ? 'AI Engine Working' : `Create Draft — Step ${step} of 2`}
        </span>
        <div className="w-8"></div>
      </header>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {step === 1 && (
          <div className="space-y-4">
            {/* Service Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white transition"
              >
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="AI Development">AI Development</option>
                <option value="RAG Chatbot">RAG Chatbot</option>
                <option value="API Integration">API Integration</option>
                <option value="ERP Integration">ERP Integration</option>
                <option value="DevOps">DevOps</option>
                <option value="Docker Deployment">Docker Deployment</option>
                <option value="Database Migration">Database Migration</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Raw Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Service Info / Idea</label>
              <textarea
                rows={4}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Describe what you can build, technologies you use, your experience, and what the buyer will receive. Write naturally. AI will optimize it."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition placeholder:text-slate-350"
              />
            </div>

            {/* Technologies tags */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technology Stack</label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                placeholder="Add technology tags (e.g. Node.js, React). Press Enter or comma."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
              />
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {technologies.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 border border-sky-100 rounded-full text-[10px] font-bold text-sky-600"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveTech(tag)}>
                        <X className="w-2.5 h-2.5 hover:text-sky-800" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Inline 3-Column Selectors */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Buyer</label>
                <select
                  value={targetBuyer}
                  onChange={(e) => setTargetBuyer(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Startup">Startup</option>
                  <option value="SaaS company">SaaS company</option>
                  <option value="Small business">Small business</option>
                  <option value="Agency">Agency</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Individual">Individual</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pricing Preference</label>
                <select
                  value={pricingPreference}
                  onChange={(e) => setPricingPreference(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Budget">Budget</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Premium">Premium</option>
                  <option value="Let AI decide">AI decides</option>
                </select>
              </div>
            </div>

            {/* Additional instructions */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extra Instructions</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Examples: 'Tone should be confident', 'Focus on database performance', etc."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed text-amber-800">
                <span className="font-bold">Pattern Analysis Only:</span> Paste any competitor content or ChatGPT research below. The AI will inspect standard tag groupings and pricing logic but writes 100% original copy. No plagiarism is allowed.
              </div>
            </div>

            {/* competitor description / ChatGPT prompt box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Competitor Descriptions / Raw Research
              </label>
              <textarea
                rows={4}
                value={competitorDescriptions}
                onChange={(e) => setCompetitorDescriptions(e.target.value)}
                placeholder="Paste descriptions of high-performing competitors, ChatGPT outline notes, or copy-pasted competitor text here."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* Double Row layout for keywords / tags */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Common Keywords</label>
                <input
                  type="text"
                  value={commonKeywords}
                  onChange={(e) => setCommonKeywords(e.target.value)}
                  placeholder="e.g. backend developer"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Popular Tags</label>
                <input
                  type="text"
                  value={popularTags}
                  onChange={(e) => setPopularTags(e.target.value)}
                  placeholder="e.g. nodejs api, express"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Double Row layout for pricing / titles */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Competitor Gig Titles</label>
                <input
                  type="text"
                  value={competitorTitles}
                  onChange={(e) => setCompetitorTitles(e.target.value)}
                  placeholder="e.g. I will design custom REST api"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Competitor Pricing Data</label>
                <input
                  type="text"
                  value={competitorPricing}
                  onChange={(e) => setCompetitorPricing(e.target.value)}
                  placeholder="e.g. Basic $50, Premium $300"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Additional market observations */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Market Observations / Notes
              </label>
              <textarea
                rows={2}
                value={marketObservations}
                onChange={(e) => setMarketObservations(e.target.value)}
                placeholder="Any other notes, trends, or comments about the niche you want to consider..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full h-full flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
              <Cpu className="w-6 h-6 text-sky-500 absolute animate-pulse" />
            </div>
            <div className="text-center space-y-1.5 max-w-xs">
              <h3 className="text-sm font-bold text-slate-700">Synthesizing Your Gig Draft</h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                DeepSeek AI is processing your input parameters to write conversion-optimized marketing copies...
              </p>
              <div className="pt-2 text-[10px] font-bold text-sky-500 animate-pulse uppercase tracking-wider">
                {genStatus}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      {step !== 3 && (
        <footer className="bg-white border-t border-slate-100 px-5 py-3.5 flex items-center justify-between shrink-0">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-slate-100"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1 px-4.5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-sky-100"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white/20" />
              <span>Generate Gig Draft</span>
            </button>
          )}
        </footer>
      )}
    </div>
  );
};
