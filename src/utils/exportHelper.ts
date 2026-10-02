/**
 * Reliable JSON export & clipboard helper that works across standard browsers
 * and sandboxed preview iframes without premature Blob URL revocation.
 */
export function triggerJsonDownload(filename: string, jsonContent: string): boolean {
  let triggered = false;
  try {
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    a.style.top = '-9999px';
    document.body.appendChild(a);
    a.click();
    triggered = true;

    // Delay revoking the object URL so the browser's async download stream completes
    window.setTimeout(() => {
      try {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        URL.revokeObjectURL(url);
      } catch {
        // Ignore cleanup errors
      }
    }, 4000);
  } catch {
    try {
      const dataUrl =
        'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      triggered = true;
      window.setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 2000);
    } catch {
      triggered = false;
    }
  }

  // Also copy to clipboard automatically as an instant fallback for sandboxed iframes
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(jsonContent).catch(() => {
      // Ignore clipboard permission errors
    });
  }

  return triggered;
}
