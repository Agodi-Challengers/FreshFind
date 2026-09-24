// Share helper: uses the Web Share API where available (phones), otherwise copies the link.
export async function shareLink({ title, text, url }, toast) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast('Link copied');
  } catch (err) {
    if (err?.name !== 'AbortError') toast('Could not share. Copy the address from your browser bar.');
  }
}
