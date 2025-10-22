const API_URL = 'http://localhost:3001';

const contextInput = document.getElementById('context');
const generateBtn = document.getElementById('generate');
const resultDiv = document.getElementById('result');
const authPrompt = document.getElementById('auth-prompt');
const mainContent = document.getElementById('main-content');

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/api/generateMail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ context: '' })
    });
    
    if (response.status === 401) {
      authPrompt.style.display = 'block';
      mainContent.style.display = 'none';
      return false;
    }
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

generateBtn.addEventListener('click', async () => {
  const context = contextInput.value.trim();
  
  if (!context) {
    showResult('Voer eerst context in', true);
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Genereren...';
  resultDiv.style.display = 'none';

  try {
    const response = await fetch(`${API_URL}/api/generateMail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ context })
    });

    if (!response.ok) {
      if (response.status === 401) {
        authPrompt.style.display = 'block';
        mainContent.style.display = 'none';
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    showResult(data.email, false);
    
    chrome.storage.local.set({ lastGenerated: data.email });
    
  } catch (error) {
    showResult(`Fout: ${error.message}`, true);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Genereer e-mail';
  }
});

function showResult(text, isError) {
  resultDiv.textContent = text;
  resultDiv.className = isError ? 'result error' : 'result';
  resultDiv.style.display = 'block';
}

checkAuth();
