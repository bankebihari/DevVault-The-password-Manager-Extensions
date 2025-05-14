chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'save_credential_prompt') {
      const newCred = request.data;
      chrome.storage.local.get('credentials', ({ credentials = [] }) => {
        const exists = credentials.some(c =>
          c.site === newCred.site &&
          (c.username === newCred.username || c.email === newCred.email)
        );
        if (!exists) {
          if (confirm(`💾 Save login for ${newCred.site}?`)) {
            chrome.storage.local.set({
              credentials: [...credentials, newCred]
            });
          }
        }
      });
    }
  });
  