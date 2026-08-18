document.addEventListener('DOMContentLoaded', () => {
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Load saved settings, fallback to your default Render URL
  chrome.storage.local.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
      serverUrlInput.value = result.serverUrl;
    } else {
      serverUrlInput.value = 'https://echo-voice-to-roadmap-pgtn.onrender.com';
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    let url = serverUrlInput.value.trim();
    // Strip trailing slash
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    chrome.storage.local.set({ serverUrl: url }, () => {
      statusMsg.style.display = 'block';
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 2000);
    });
  });
});
