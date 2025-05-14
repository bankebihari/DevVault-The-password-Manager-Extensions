import React, { useEffect, useState } from 'react';
import './style.css';

function hashString(str) {
  return btoa(str); // Replace with stronger hash for real app
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  const [masterInput, setMasterInput] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['masterPasswordHash'], (result) => {
      if (result.masterPasswordHash) {
        setHasMasterPassword(true);
      }
    });

    chrome.storage.local.get(['credentials'], (result) => {
      if (result.credentials) {
        setCredentials(result.credentials);
      }
    });
  }, []);

  const handleMasterSubmit = () => {
    chrome.storage.local.get(['masterPasswordHash'], (result) => {
      const savedHash = result.masterPasswordHash;
      if (!savedHash) {
        chrome.storage.local.set({ masterPasswordHash: hashString(masterInput) }, () => {
          setIsUnlocked(true);
        });
      } else {
        if (hashString(masterInput) === savedHash) {
          setIsUnlocked(true);
        } else {
          alert('❌ Incorrect master password');
        }
      }
    });
  };

  const checkPasswordStrength = (pass) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    const length = pass.length;

    if (length > 8 && hasUpper && hasLower && hasNumber && hasSpecial) return 'Strong ✅';
    if (length > 6 && ((hasUpper && hasNumber) || (hasLower && hasNumber))) return 'Medium ⚠️';
    return 'Weak ❌';
  };

  const saveCredential = () => {
    if (!site || !password || (!username && !email)) {
      alert('❗ Site, Password, and either Username or Email are required');
      return;
    }

    const newEntry = { site, username, email, password };
    const updated = [...credentials, newEntry];
    chrome.storage.local.set({ credentials: updated }, () => {
      setCredentials(updated);
      setSite('');
      setUsername('');
      setEmail('');
      setPassword('');
      setPasswordStrength('');
    });
  };

  const deleteCredential = (indexToDelete) => {
    if (!isUnlocked) {
      alert('🔐 Enter master password to delete credentials!');
      return;
    }

    const updated = credentials.filter((_, index) => index !== indexToDelete);
    chrome.storage.local.set({ credentials: updated }, () => {
      setCredentials(updated);
    });
  };

  const renderUnlockSection = () => (
    <div className="container">
      <h2>🔐 DevVault</h2>
      <p>{hasMasterPassword ? 'Enter your master password to unlock' : 'Set your master password'}</p>
      <input
        type="password"
        placeholder="Master Password"
        value={masterInput}
        onChange={(e) => setMasterInput(e.target.value)}
      />
      <button onClick={handleMasterSubmit}>🔓 Unlock</button>
    </div>
  );

  const renderCredentialList = () => {
    if (!isUnlocked) {
      return <p>🔐 Credentials are locked. Enter master password to view or delete them.</p>;
    }

    return (
      <div>
        <p>🔢 Total saved credentials: {credentials.length}</p>
        <ul>
          {credentials.length === 0 && <p>📭 No credentials saved yet.</p>}
          {credentials.map((cred, index) => (
            <li key={index}>
              <div>
                <strong>🌐 {cred.site}</strong><br />
                {cred.username && <>👤 {cred.username}<br /></>}
                {cred.email && <>📧 {cred.email}<br /></>}
                🔑 {cred.password}
              </div>
              <button className="delete-btn" onClick={() => deleteCredential(index)}>❌ Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container">
      {!isUnlocked && renderUnlockSection()}

      <div className="form">
        <label>🌐 Site</label>
        <input
          type="text"
          placeholder="e.g. github.com"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
        <label>👤 Username</label>
        <input
          type="text"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>📧 Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>🔑 Password</label>
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(checkPasswordStrength(e.target.value));
          }}
        />
        {password && <p>Password strength: {passwordStrength}</p>}
        <button onClick={saveCredential}>💾 Save Credential</button>
      </div>

      {renderCredentialList()}
    </div>
  );
}

export default App;
