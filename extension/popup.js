document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('statusText');
  const sessionDot = document.getElementById('sessionDot');

  try {
    const result = await chrome.storage.local.get(['focusActive']);
    const active = !!result.focusActive;
    statusText.textContent = active ? 'Active' : 'Inactive';
    sessionDot.classList.toggle('on', active);
  } catch (e) {
    statusText.textContent = 'Error';
  }
});