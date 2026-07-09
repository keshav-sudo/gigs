// Adapter to interface with Fiverr Gig Creation DOM elements safely.
// Separates DOM selectors from React UI logic to ease maintenance when selectors change.

export interface GigFormFields {
  titleField?: HTMLTextAreaElement | HTMLInputElement | null;
  descriptionField?: HTMLTextAreaElement | HTMLDivElement | null;
}

export const getGigFormFields = (): GigFormFields => {
  // Fiverr Title element typically has name="title" or is a textarea with maxlength 80
  const titleField = document.querySelector(
    'textarea[name="title"], textarea[maxlength="80"], .gig-title-textarea, #gig-title'
  ) as HTMLTextAreaElement | HTMLInputElement | null;

  // Fiverr Description field is usually a textarea or rich-text-editor editor div
  const descriptionField = document.querySelector(
    'textarea[name="description"], .description-textarea, .rich-text-editor, [data-testid="description-editor"]'
  ) as HTMLTextAreaElement | HTMLDivElement | null;

  return {
    titleField,
    descriptionField
  };
};

export const applyValueToField = (
  element: HTMLTextAreaElement | HTMLInputElement | HTMLDivElement,
  value: string
): boolean => {
  try {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      element.value = value;
    } else {
      element.innerText = value;
    }

    // Trigger synthetic input events so Fiverr's React/Angular hooks capture changes
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (error) {
    console.error('Error applying value to field:', error);
    return false;
  }
};
