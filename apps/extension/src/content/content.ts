import { getGigFormFields, applyValueToField } from './adapters/gigFormAdapter.js';

interface GigDraftSummary {
  _id: string;
  serviceType: string;
  generatedContent?: {
    gigTitle: string;
    description: string;
  };
}

let activeDrafts: GigDraftSummary[] = [];
let jwtToken: string | null = null;
let currentSelectedDraft: any = null;

// Initialize Assistant
const initAssistant = async () => {
  // Retrieve token from local storage
  const storage = await chrome.storage.local.get(['token']);
  jwtToken = storage.token || null;

  createFloatingButton();
};

const createFloatingButton = () => {
  const existing = document.getElementById('gigcraft-assistant-root');
  if (existing) return;

  const container = document.createElement('div');
  container.id = 'gigcraft-assistant-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';

  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Floating Button Style
  const button = document.createElement('button');
  button.innerText = '✨ GigCraft Assistant';
  button.style.backgroundColor = '#0ea5e9';
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.borderRadius = '50px';
  button.style.padding = '12px 20px';
  button.style.fontSize = '14px';
  button.style.fontWeight = '600';
  button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  button.style.transition = 'all 0.2s';

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#0284c7';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#0ea5e9';
    button.style.transform = 'scale(1)';
  });

  button.addEventListener('click', () => {
    togglePanel(shadowRoot);
  });

  shadowRoot.appendChild(button);
  document.body.appendChild(container);
};

const togglePanel = async (shadowRoot: ShadowRoot) => {
  const panelId = 'gigcraft-assistant-panel';
  const existingPanel = shadowRoot.getElementById(panelId);

  if (existingPanel) {
    existingPanel.remove();
    return;
  }

  // Retrieve token again to ensure sync
  const storage = await chrome.storage.local.get(['token']);
  jwtToken = storage.token || null;

  const panel = document.createElement('div');
  panel.id = panelId;
  panel.style.position = 'fixed';
  panel.style.bottom = '80px';
  panel.style.right = '20px';
  panel.style.width = '350px';
  panel.style.maxHeight = '500px';
  panel.style.backgroundColor = '#ffffff';
  panel.style.border = '1px solid #e5e7eb';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  panel.style.overflowY = 'auto';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  panel.style.padding = '16px';
  panel.style.zIndex = '9999999';

  // Panel Title Header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';

  const title = document.createElement('h3');
  title.innerText = 'GigCraft Drafts';
  title.style.margin = '0';
  title.style.fontSize = '16px';
  title.style.fontWeight = '700';
  title.style.color = '#1f2937';

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✕';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#9ca3af';
  closeBtn.addEventListener('click', () => panel.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  if (!jwtToken) {
    const errorMsg = document.createElement('div');
    errorMsg.innerText = 'Please sign in to GigCraft AI extension to access your drafts.';
    errorMsg.style.color = '#ef4444';
    errorMsg.style.fontSize = '13px';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.marginTop = '20px';
    panel.appendChild(errorMsg);
    shadowRoot.appendChild(panel);
    return;
  }

  // Loading State
  const loader = document.createElement('div');
  loader.innerText = 'Loading your drafts...';
  loader.style.fontSize = '13px';
  loader.style.color = '#6b7280';
  loader.style.textAlign = 'center';
  loader.style.marginTop = '20px';
  panel.appendChild(loader);
  shadowRoot.appendChild(panel);

  try {
    const response = await fetch('https://gigs-yzib.onrender.com/api/gigs', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    loader.remove();

    if (!response.ok) {
      throw new Error('Failed to fetch gigs');
    }

    activeDrafts = await response.json();

    if (activeDrafts.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.innerText = 'No completed drafts found. Use the extension popup to generate a gig!';
      emptyMsg.style.color = '#4b5563';
      emptyMsg.style.fontSize = '13px';
      emptyMsg.style.textAlign = 'center';
      panel.appendChild(emptyMsg);
      return;
    }

    renderDraftList(panel);
  } catch (error) {
    loader.remove();
    const errorMsg = document.createElement('div');
    errorMsg.innerText = 'Error loading drafts. Ensure API is running.';
    errorMsg.style.color = '#ef4444';
    errorMsg.style.fontSize = '13px';
    errorMsg.style.textAlign = 'center';
    panel.appendChild(errorMsg);
  }
};

const renderDraftList = (panel: HTMLDivElement) => {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '10px';

  // Dropdown selector
  const label = document.createElement('label');
  label.innerText = 'Select Gig Draft:';
  label.style.fontSize = '12px';
  label.style.fontWeight = '600';
  label.style.color = '#4b5563';
  container.appendChild(label);

  const select = document.createElement('select');
  select.style.padding = '8px';
  select.style.borderRadius = '6px';
  select.style.border = '1px solid #d1d5db';
  select.style.fontSize = '13px';

  const defaultOpt = document.createElement('option');
  defaultOpt.innerText = '-- Select Draft --';
  defaultOpt.value = '';
  select.appendChild(defaultOpt);

  activeDrafts.forEach((draft) => {
    const opt = document.createElement('option');
    opt.value = draft._id;
    opt.innerText = `${draft.serviceType} (${draft.generatedContent?.gigTitle ? 'Generated' : 'Incomplete'})`;
    select.appendChild(opt);
  });

  container.appendChild(select);

  // Preview / Apply interface
  const actionArea = document.createElement('div');
  actionArea.style.marginTop = '12px';
  actionArea.style.display = 'flex';
  actionArea.style.flexDirection = 'column';
  actionArea.style.gap = '12px';
  container.appendChild(actionArea);

  select.addEventListener('change', () => {
    const draftId = select.value;
    actionArea.innerHTML = '';

    if (!draftId) return;

    currentSelectedDraft = activeDrafts.find((d) => d._id === draftId);
    if (!currentSelectedDraft || !currentSelectedDraft.generatedContent) {
      const warning = document.createElement('div');
      warning.innerText = 'This draft has no generated content. Go to extension to run AI generation.';
      warning.style.fontSize = '12px';
      warning.style.color = '#d97706';
      actionArea.appendChild(warning);
      return;
    }

    renderApplyButtons(actionArea);
  });

  panel.appendChild(container);
};

const renderApplyButtons = (container: HTMLDivElement) => {
  const fields = getGigFormFields();

  // 1. Gig Title Section
  const titleBox = document.createElement('div');
  titleBox.style.padding = '10px';
  titleBox.style.borderRadius = '8px';
  titleBox.style.backgroundColor = '#f9fafb';
  titleBox.style.border = '1px solid #f3f4f6';

  const titleHeader = document.createElement('div');
  titleHeader.style.display = 'flex';
  titleHeader.style.justifyContent = 'space-between';
  titleHeader.style.alignItems = 'center';
  titleHeader.style.marginBottom = '6px';

  const titleLabel = document.createElement('span');
  titleLabel.innerText = 'Optimized Title';
  titleLabel.style.fontSize = '12px';
  titleLabel.style.fontWeight = '600';
  titleLabel.style.color = '#374151';

  const useTitleBtn = document.createElement('button');
  useTitleBtn.innerText = 'Insert Title';
  useTitleBtn.style.padding = '4px 8px';
  useTitleBtn.style.backgroundColor = fields.titleField ? '#10b981' : '#d1d5db';
  useTitleBtn.style.color = '#ffffff';
  useTitleBtn.style.fontSize = '11px';
  useTitleBtn.style.fontWeight = '600';
  useTitleBtn.style.border = 'none';
  useTitleBtn.style.borderRadius = '4px';
  useTitleBtn.style.cursor = fields.titleField ? 'pointer' : 'not-allowed';
  
  if (fields.titleField) {
    useTitleBtn.addEventListener('click', () => {
      const success = applyValueToField(fields.titleField!, currentSelectedDraft.generatedContent.gigTitle);
      if (success) {
        useTitleBtn.innerText = '✓ Applied';
        useTitleBtn.style.backgroundColor = '#059669';
        setTimeout(() => {
          useTitleBtn.innerText = 'Insert Title';
          useTitleBtn.style.backgroundColor = '#10b981';
        }, 2000);
      }
    });
  }

  const titlePreview = document.createElement('div');
  titlePreview.innerText = currentSelectedDraft.generatedContent.gigTitle;
  titlePreview.style.fontSize = '12px';
  titlePreview.style.color = '#4b5563';
  titlePreview.style.lineHeight = '1.4';

  titleHeader.appendChild(titleLabel);
  titleHeader.appendChild(useTitleBtn);
  titleBox.appendChild(titleHeader);
  titleBox.appendChild(titlePreview);
  container.appendChild(titleBox);

  // 2. Gig Description Section
  const descBox = document.createElement('div');
  descBox.style.padding = '10px';
  descBox.style.borderRadius = '8px';
  descBox.style.backgroundColor = '#f9fafb';
  descBox.style.border = '1px solid #f3f4f6';

  const descHeader = document.createElement('div');
  descHeader.style.display = 'flex';
  descHeader.style.justifyContent = 'space-between';
  descHeader.style.alignItems = 'center';
  descHeader.style.marginBottom = '6px';

  const descLabel = document.createElement('span');
  descLabel.innerText = 'Full Description';
  descLabel.style.fontSize = '12px';
  descLabel.style.fontWeight = '600';
  descLabel.style.color = '#374151';

  const useDescBtn = document.createElement('button');
  useDescBtn.innerText = 'Insert Description';
  useDescBtn.style.padding = '4px 8px';
  useDescBtn.style.backgroundColor = fields.descriptionField ? '#10b981' : '#d1d5db';
  useDescBtn.style.color = '#ffffff';
  useDescBtn.style.fontSize = '11px';
  useDescBtn.style.fontWeight = '600';
  useDescBtn.style.border = 'none';
  useDescBtn.style.borderRadius = '4px';
  useDescBtn.style.cursor = fields.descriptionField ? 'pointer' : 'not-allowed';

  if (fields.descriptionField) {
    useDescBtn.addEventListener('click', () => {
      const success = applyValueToField(fields.descriptionField!, currentSelectedDraft.generatedContent.description);
      if (success) {
        useDescBtn.innerText = '✓ Applied';
        useDescBtn.style.backgroundColor = '#059669';
        setTimeout(() => {
          useDescBtn.innerText = 'Insert Description';
          useDescBtn.style.backgroundColor = '#10b981';
        }, 2000);
      }
    });
  }

  const descPreview = document.createElement('div');
  descPreview.innerText = currentSelectedDraft.generatedContent.description.substring(0, 120) + '...';
  descPreview.style.fontSize = '12px';
  descPreview.style.color = '#4b5563';
  descPreview.style.lineHeight = '1.4';

  descHeader.appendChild(descLabel);
  descHeader.appendChild(useDescBtn);
  descBox.appendChild(descHeader);
  descBox.appendChild(descPreview);
  container.appendChild(descBox);

  // Field indicator message
  const statusMsg = document.createElement('div');
  statusMsg.style.fontSize = '11px';
  statusMsg.style.textAlign = 'center';
  statusMsg.style.color = '#9ca3af';

  if (!fields.titleField && !fields.descriptionField) {
    statusMsg.innerText = 'Open Fiverr Gig Creation page to auto-insert fields.';
    statusMsg.style.color = '#d97706';
  } else {
    statusMsg.innerText = 'Detected supported fields. Click Green buttons to insert.';
  }
  container.appendChild(statusMsg);
};

// Check path and initialize
if (window.location.hostname.includes('fiverr.com')) {
  // Let the page render before booting assistant
  setTimeout(initAssistant, 2000);
}
export {};
