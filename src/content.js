// src/content.js

function getLoginFields() {
    const inputs = document.querySelectorAll('input');
    let username = null;
    let email = null;
    let password = null;
  
    inputs.forEach((input) => {
      const name = input.name?.toLowerCase() || '';
      const type = input.type?.toLowerCase() || '';
  
      if (!password && type === 'password') password = input;
      else if (!email && (type === 'email' || name.includes('email'))) email = input;
      else if (!username && (type === 'text' || name.includes('user'))) username = input;
    });
  
    return { username, email, password };
  }
  
  function waitForLoginFields(maxAttempts = 10, interval = 500) {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        const { username, email, password } = getLoginFields();
        if ((username || email) && password) {
          resolve({ username, email, password });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, interval);
        } else {
          resolve({ username: null, email: null, password: null });
        }
      };
      check();
    });
  }
  
  async function autofill() {
    chrome.storage.local.get(['credentials'], async (result) => {
      const creds = result.credentials || [];
      const domain = window.location.hostname;
  
      const match = creds.find(c => domain.includes(c.site));
      if (!match) return;
  
      const { username, email, password } = await waitForLoginFields();
      if (match.username && username) username.value = match.username;
      if (match.email && email) email.value = match.email;
      if (match.password && password) password.value = match.password;
    });
  }
  
  function detectLoginSubmission() {
    const form = document.querySelector('form');
    if (!form) return;
  
    form.addEventListener('submit', () => {
      const { username, email, password } = getLoginFields();
  
      const site = window.location.hostname;
      const newEntry = {
        site,
        username: username?.value || '',
        email: email?.value || '',
        password: password?.value || ''
      };
  
      chrome.storage.local.get(['credentials'], (result) => {
        const creds = result.credentials || [];
        const exists = creds.some(c => c.site === site && (c.username === newEntry.username || c.email === newEntry.email));
        if (!exists && (newEntry.password && (newEntry.username || newEntry.email))) {
          chrome.runtime.sendMessage({
            action: 'save_credential_prompt',
            data: newEntry
          });
        }
      });
    });
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    autofill();
    detectLoginSubmission();
  });
  