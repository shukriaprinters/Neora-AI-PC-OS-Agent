/**
 * Failsafe clipboard copier utility.
 * Designed to work inside sandboxed iframe environments (such as AI Studio preview containers)
 * where navigator.clipboard might be blocked or undefined.
 */
export async function copyToClipboardFailsafe(text: string): Promise<boolean> {
  // Method 1: Try modern Clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Modern navigator.clipboard failed, attempting fallback copy...', err);
    }
  }

  // Method 2: Failsafe Textarea Fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Position out of sight securely
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    }
    throw new Error('execCommand copy returned false');
  } catch (err) {
    console.error('Failsafe fallback copy operation failed:', err);
    return false;
  }
}
