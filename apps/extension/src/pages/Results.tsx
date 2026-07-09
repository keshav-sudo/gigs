import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ArrowLeft, Copy, Edit, Save, RefreshCw, FileText, Check, ChevronDown, Sparkles } from 'lucide-react';

interface ResultsProps {
  onNavigate: (screen: string) => void;
  selectedDraftId: string;
  showToast: (text: string, type: 'success' | 'warning' | 'error') => void;
}

export const Results: React.FC<ResultsProps> = ({
  onNavigate,
  selectedDraftId,
  showToast
}) => {
  const [draft, setDraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activePkgTab, setActivePkgTab] = useState<'basic' | 'standard' | 'premium'>('basic');

  // Edit states
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [shortSummary, setShortSummary] = useState('');

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  const [isEditingPackages, setIsEditingPackages] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgPrice, setPkgPrice] = useState(0);
  const [pkgDelivery, setPkgDelivery] = useState(1);
  const [pkgRevisions, setPkgRevisions] = useState(0);
  const [pkgFeatures, setPkgFeatures] = useState('');

  // Section regeneration states
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [regenInstruction, setRegenInstruction] = useState('Make More Professional');
  const [customRegenText, setCustomRegenText] = useState('');
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);

  const fetchDraft = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGigById(selectedDraftId);
      setDraft(data);

      // Populate edit states
      if (data.generatedContent) {
        setGigTitle(data.generatedContent.gigTitle);
        setCategory(data.generatedContent.category);
        setSubcategory(data.generatedContent.subcategory);
        setShortSummary(data.generatedContent.shortSummary);
        setDescription(data.generatedContent.description);

        const currentPkg = data.generatedContent.packages[activePkgTab];
        setPkgName(currentPkg.name);
        setPkgDesc(currentPkg.description);
        setPkgPrice(currentPkg.price);
        setPkgDelivery(currentPkg.deliveryDays);
        setPkgRevisions(currentPkg.revisions);
        setPkgFeatures(currentPkg.features.join('\n'));
      }
    } catch (err) {
      showToast('Error loading gig draft results.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, [selectedDraftId]);

  // Sync package editing values when switching tabs
  useEffect(() => {
    if (draft?.generatedContent) {
      const currentPkg = draft.generatedContent.packages[activePkgTab];
      setPkgName(currentPkg.name);
      setPkgDesc(currentPkg.description);
      setPkgPrice(currentPkg.price);
      setPkgDelivery(currentPkg.deliveryDays);
      setPkgRevisions(currentPkg.revisions);
      setPkgFeatures(currentPkg.features.join('\n'));
    }
  }, [activePkgTab, draft]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveOverview = async () => {
    try {
      const updatedContent = {
        ...draft.generatedContent,
        gigTitle,
        category,
        subcategory,
        shortSummary
      };
      const updatedDraft = await api.updateGig(selectedDraftId, { generatedContent: updatedContent });
      setDraft(updatedDraft);
      setIsEditingOverview(false);
      showToast('Overview saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save overview', 'error');
    }
  };

  const handleSaveDescription = async () => {
    try {
      const updatedContent = {
        ...draft.generatedContent,
        description
      };
      const updatedDraft = await api.updateGig(selectedDraftId, { generatedContent: updatedContent });
      setDraft(updatedDraft);
      setIsEditingDescription(false);
      showToast('Description saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save description', 'error');
    }
  };

  const handleSavePackage = async () => {
    try {
      const updatedPackages = {
        ...draft.generatedContent.packages,
        [activePkgTab]: {
          name: pkgName,
          description: pkgDesc,
          price: Number(pkgPrice),
          deliveryDays: Number(pkgDelivery),
          revisions: Number(pkgRevisions),
          features: pkgFeatures.split('\n').filter((f) => f.trim() !== '')
        }
      };

      const updatedContent = {
        ...draft.generatedContent,
        packages: updatedPackages
      };

      const updatedDraft = await api.updateGig(selectedDraftId, { generatedContent: updatedContent });
      setDraft(updatedDraft);
      setIsEditingPackages(false);
      showToast('Package saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save package', 'error');
    }
  };

  const handleRegenerateSection = async () => {
    if (!regenSection) return;
    setIsRegeneratingSection(true);
    const finalInstruction = regenInstruction === 'custom' ? customRegenText : regenInstruction;

    if (!finalInstruction.trim()) {
      showToast('Please specify regeneration instructions.', 'warning');
      setIsRegeneratingSection(false);
      return;
    }

    try {
      const updatedDraft = await api.regenerateSection(selectedDraftId, regenSection, finalInstruction);
      setDraft(updatedDraft);
      setRegenSection(null);
      setCustomRegenText('');
      showToast('Section regenerated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate section.', 'error');
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  const copyCompleteGig = () => {
    if (!draft || !draft.generatedContent) return;
    const gc = draft.generatedContent;

    const text = `
# GIG TITLE
${gc.gigTitle}

# CATEGORY
Category: ${gc.category} > Subcategory: ${gc.subcategory}

# SEARCH TAGS
${gc.searchTags.join(', ')}

# SEO KEYWORDS
${gc.seoKeywords.join(', ')}

# PRICING PACKAGES
---
## BASIC: ${gc.packages.basic.name}
Description: ${gc.packages.basic.description}
Price: $${gc.packages.basic.price} | Delivery: ${gc.packages.basic.deliveryDays} Days | Revisions: ${gc.packages.basic.revisions}
Features:
${gc.packages.basic.features.map((f: string) => `- ${f}`).join('\n')}

## STANDARD: ${gc.packages.standard.name}
Description: ${gc.packages.standard.description}
Price: $${gc.packages.standard.price} | Delivery: ${gc.packages.standard.deliveryDays} Days | Revisions: ${gc.packages.standard.revisions}
Features:
${gc.packages.standard.features.map((f: string) => `- ${f}`).join('\n')}

## PREMIUM: ${gc.packages.premium.name}
Description: ${gc.packages.premium.description}
Price: $${gc.packages.premium.price} | Delivery: ${gc.packages.premium.deliveryDays} Days | Revisions: ${gc.packages.premium.revisions}
Features:
${gc.packages.premium.features.map((f: string) => `- ${f}`).join('\n')}

# DESCRIPTION
${gc.description}

# FREQUENTLY ASKED QUESTIONS
${gc.faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

# BUYER REQUIREMENTS
${gc.buyerRequirements.map((r: string) => `- ${r}`).join('\n')}

# THUMBNAIL COPY
Headline: ${gc.thumbnail.headline}
Supporting Text: ${gc.thumbnail.supportingText}
Visual Concept: ${gc.thumbnail.visualConcept}

# POSITIONING STRATEGY
Target Buyer: ${gc.strategyExplanation.targetBuyer}
Differentiation: ${gc.strategyExplanation.differentiation}
Pricing Logic: ${gc.strategyExplanation.pricingLogic}
    `.trim();

    handleCopy(text, 'complete-gig');
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 mt-2">Loading generated results...</span>
      </div>
    );
  }

  const gc = draft?.generatedContent;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shadow-sm shrink-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">Dashboard</span>
        </button>
        <span className="text-xs font-bold text-slate-800">Generated Gig Draft</span>
        <button
          onClick={copyCompleteGig}
          className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-100 rounded-xl text-[10px] font-bold transition"
        >
          <Copy className="w-3 h-3" />
          <span>Copy Complete Gig</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Overview Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">1. Gig Overview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingOverview(!isEditingOverview)}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                {isEditingOverview ? <Save className="w-3.5 h-3.5 text-emerald-500" onClick={handleSaveOverview} /> : <Edit className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setRegenSection('gigTitle')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(gc.gigTitle, 'title')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isEditingOverview ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold">Gig Title</label>
                <textarea
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold">Subcategory</label>
                  <input
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold">Short Summary</label>
                <input
                  value={shortSummary}
                  onChange={(e) => setShortSummary(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 leading-snug">{gc.gigTitle}</div>
              <div className="flex flex-wrap gap-2 text-[9px] text-slate-400">
                <span>Category: <strong className="text-slate-600">{gc.category} &gt; {gc.subcategory}</strong></span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                {gc.shortSummary}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Tiers Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">2. Pricing Packages</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingPackages(!isEditingPackages)}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                {isEditingPackages ? <Save className="w-3.5 h-3.5 text-emerald-500" onClick={handleSavePackage} /> : <Edit className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setRegenSection(`packages.${activePkgTab}`)}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(JSON.stringify(gc.packages[activePkgTab], null, 2), `pkg-${activePkgTab}`)}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Package Tabs */}
          <div className="flex border border-slate-100 rounded-xl overflow-hidden text-[10px] font-bold">
            {(['basic', 'standard', 'premium'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActivePkgTab(t)}
                className={`flex-1 py-1.5 text-center capitalize transition ${
                  activePkgTab === t
                    ? 'bg-slate-800 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {isEditingPackages ? (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold">Package Name</label>
                <input
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold">Scope Description</label>
                <textarea
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold">Price ($)</label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold">Delivery (Days)</label>
                  <input
                    type="number"
                    value={pkgDelivery}
                    onChange={(e) => setPkgDelivery(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold">Revisions</label>
                  <input
                    type="number"
                    value={pkgRevisions}
                    onChange={(e) => setPkgRevisions(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-semibold">Features (one per line)</label>
                <textarea
                  value={pkgFeatures}
                  onChange={(e) => setPkgFeatures(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{gc.packages[activePkgTab].name}</span>
                <span className="text-sm font-black text-sky-600">${gc.packages[activePkgTab].price}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{gc.packages[activePkgTab].description}</p>
              <div className="flex gap-4 text-[9px] text-slate-400 border-t border-b border-slate-50 py-1.5">
                <span>Delivery: <strong>{gc.packages[activePkgTab].deliveryDays} Days</strong></span>
                <span>Revisions: <strong>{gc.packages[activePkgTab].revisions === -1 ? 'Unlimited' : gc.packages[activePkgTab].revisions}</strong></span>
              </div>
              <ul className="space-y-1">
                {gc.packages[activePkgTab].features.map((f: string, i: number) => (
                  <li key={i} className="text-[9px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-sky-400 rounded-full shrink-0"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Description Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">3. Full Description</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingDescription(!isEditingDescription)}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                {isEditingDescription ? <Save className="w-3.5 h-3.5 text-emerald-500" onClick={handleSaveDescription} /> : <Edit className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setRegenSection('description')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(gc.description, 'desc')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isEditingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              rows={10}
            />
          ) : (
            <div className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl max-h-[220px] overflow-y-auto">
              {gc.description}
            </div>
          )}
        </div>

        {/* Keywords & Tags */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">4. SEO Keywords & Search Tags</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(`Tags: ${gc.searchTags.join(', ')}\nKeywords: ${gc.seoKeywords.join(', ')}`, 'seo')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Fiverr Search Tags (Max 5)</span>
              <div className="flex flex-wrap gap-1.5">
                {gc.searchTags.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-sky-50 border border-sky-100 rounded-full text-[9px] font-bold text-sky-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Target SEO Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {gc.seoKeywords.map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[9px] font-bold text-slate-600">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">5. FAQs</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRegenSection('faqs')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(gc.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'), 'faqs')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            {gc.faqs.map((faq: any, i: number) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-700 block">Q: {faq.question}</span>
                <p className="text-[9px] text-slate-500 leading-normal">A: {faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail Copy Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">6. Gig Thumbnail Blueprint</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(`Headline: ${gc.thumbnail.headline}\nSupporting: ${gc.thumbnail.supportingText}\nStyle: ${gc.thumbnail.visualConcept}`, 'thumb')}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="p-2.5 bg-slate-800 text-white rounded-xl text-center space-y-1">
              <span className="text-[8px] font-bold text-sky-400 uppercase tracking-wider block">Recommended Headline</span>
              <span className="text-xs font-black tracking-tight">{gc.thumbnail.headline}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Key Bullet Points</span>
                <p className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-line">{gc.thumbnail.supportingText}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Layout Concept</span>
                <p className="text-[9px] text-slate-500 leading-relaxed">{gc.thumbnail.visualConcept}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy explanation card */}
        <div className="bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-md">
          <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-sky-400/20" /> Positioning strategy analysis
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Positioning</span>
              <p className="text-[9px] text-slate-200 leading-normal">{gc.strategyExplanation.positioning}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Differentiation</span>
              <p className="text-[9px] text-slate-200 leading-normal">{gc.strategyExplanation.differentiation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regeneration Modal overlay */}
      {regenSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xl w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">Regenerate Section</h3>
              <button onClick={() => setRegenSection(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {isRegeneratingSection ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider animate-pulse">
                  AI is rebuilding section...
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Improvement Style</label>
                  <select
                    value={regenInstruction}
                    onChange={(e) => setRegenInstruction(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="Improve Section">Improve / Rewrite</option>
                    <option value="Make More Professional">Make More Professional</option>
                    <option value="Make More Technical">Make More Technical</option>
                    <option value="Make More Buyer-Friendly">Make More Buyer-Friendly</option>
                    <option value="Shorten Content">Shorten Content</option>
                    <option value="custom">Custom Instruction...</option>
                  </select>
                </div>

                {regenInstruction === 'custom' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Custom Prompt</label>
                    <textarea
                      value={customRegenText}
                      onChange={(e) => setCustomRegenText(e.target.value)}
                      placeholder="e.g. Focus on deployment speed and scalability details."
                      className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>
                )}

                <button
                  onClick={handleRegenerateSection}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                >
                  Regenerate Section
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
