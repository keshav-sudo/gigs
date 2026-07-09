// Storage utility providing fallback for browser testing vs Chrome Extension context

export const getStorageValue = async (key: string): Promise<any> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    }
  } catch (e) {
    console.warn('Chrome storage API failed, falling back to localStorage:', e);
  }
  
  return localStorage.getItem(key);
};

export const setStorageValue = async (key: string, value: any): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
  } catch (e) {
    console.warn('Chrome storage API failed, falling back to localStorage:', e);
  }
  
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

export const removeStorageValue = async (key: string): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(key);
      return;
    }
  } catch (e) {
    console.warn('Chrome storage API failed, falling back to localStorage:', e);
  }
  
  localStorage.removeItem(key);
};
