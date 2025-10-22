(function () {
  const SIDEBAR_ID = 'mailsprint-sidebar-container';
  
  // Detect environment: try localhost first (development), fallback to production
  const API_BASE_URL = (() => {
    // Default to localhost for development
    return 'http://localhost:3000';
  })();
  
  // Production fallback URL
  const PRODUCTION_URL = 'https://email-ai-git-main-guido1997devs-projects.vercel.app';
  
  // Helper function to fetch with fallback
  async function fetchWithFallback(url, options) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      // If localhost fails, try production
      if (url.includes('localhost')) {
        const prodUrl = url.replace(API_BASE_URL, PRODUCTION_URL);
        return fetch(prodUrl, options);
      }
      throw error;
    }
  }
  
  // For opening webapp reference emails page
  const APP_URL = PRODUCTION_URL;

  function mountSidebar() {
    if (document.getElementById(SIDEBAR_ID)) return;
    
    const container = document.createElement('div');
    container.id = SIDEBAR_ID;
    
    const panel = document.createElement('div');
    panel.id = 'mailsprint-sidebar-panel';
    
    // Extract context immediately
    const emailContext = extractGmailThreadText();
    
    panel.innerHTML = `
      <div class="mailsprint-sidebar-header">
        <div class="mailsprint-sidebar-logo">✨ MailSprint AI</div>
        <button class="mailsprint-sidebar-close" id="close-sidebar">×</button>
      </div>
      
      <div class="mailsprint-sidebar-content">
        <!-- Section 1: Input -->
        <div class="mailsprint-section">
          <div class="mailsprint-section-header">
            <span class="mailsprint-section-icon">✍️</span>
            <span class="mailsprint-section-title">Wat wil je schrijven?</span>
          </div>
          <textarea 
            id="sidebar-input" 
            class="mailsprint-textarea" 
            placeholder="Bijv: 'Stuur een vriendelijke follow-up' of 'Vraag om een meeting volgende week'..."
            rows="4"
          ></textarea>
        </div>

        <!-- Section 2: Analyse/Context -->
        <div class="mailsprint-section">
          <div class="mailsprint-section-header">
            <span class="mailsprint-section-icon">🔍</span>
            <span class="mailsprint-section-title">Thread Analyse</span>
            <button id="refresh-context" class="mailsprint-refresh-btn" title="Ververs context">↻</button>
          </div>
          <div id="sidebar-analysis" class="mailsprint-analysis">
            ${emailContext.hasThread ? `
              <div class="mailsprint-context-card">
                ${emailContext.userEmail ? `
                  <div class="mailsprint-context-item">
                    <span class="mailsprint-context-label">✍️ Jij (afzender):</span>
                    <span class="mailsprint-context-value">${emailContext.userEmail}</span>
                  </div>
                ` : ''}
                <div class="mailsprint-context-item">
                  <span class="mailsprint-context-label">📧 Onderwerp:</span>
                  <span class="mailsprint-context-value">${emailContext.subject || 'Geen onderwerp'}</span>
                </div>
                ${emailContext.from ? `
                  <div class="mailsprint-context-item">
                    <span class="mailsprint-context-label">👤 Van (ontvangen van):</span>
                    <span class="mailsprint-context-value">${emailContext.from}</span>
                  </div>
                ` : ''}
                <div class="mailsprint-context-item">
                  <span class="mailsprint-context-label">📬 Laatste bericht:</span>
                  <div class="mailsprint-context-text">${emailContext.lastMessage}</div>
                </div>
                <div class="mailsprint-context-item">
                  <span class="mailsprint-context-label">💬 Berichten:</span>
                  <span class="mailsprint-context-value">${emailContext.messageCount} in thread</span>
                </div>
              </div>
            ` : `
              <div class="mailsprint-empty-state">
                <span class="mailsprint-empty-icon">📭</span>
                <p>Geen thread gevonden</p>
                <p class="mailsprint-empty-hint">Open een email of reply om context te zien</p>
              </div>
            `}
          </div>
        </div>

        <!-- Section 3: Output -->
        <div class="mailsprint-section">
          <div class="mailsprint-section-header">
            <span class="mailsprint-section-icon">✉️</span>
            <span class="mailsprint-section-title">Gegenereerde Email</span>
          </div>
          <div id="sidebar-output" class="mailsprint-output">
            <div class="mailsprint-empty-state">
              <span class="mailsprint-empty-icon">⚡</span>
              <p>Klik op 'Genereer Email' om te beginnen</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mailsprint-sidebar-actions">
          <button id="generate-email" class="mailsprint-btn mailsprint-btn-primary">
            <span class="mailsprint-btn-icon">✨</span>
            Genereer Email
          </button>
          <button id="paste-email" class="mailsprint-btn mailsprint-btn-secondary" style="display: none;">
            <span class="mailsprint-btn-icon">📋</span>
            Plak in Gmail
          </button>
          <button id="open-reference-emails" class="mailsprint-btn">
            <span class="mailsprint-btn-icon">📚</span>
            Referentie e-mails
          </button>
        </div>
      </div>
    `;
    
    container.appendChild(panel);
    document.documentElement.appendChild(container);
    
    // Add event listeners
    setupSidebarEventListeners(panel);
  }

  function setupSidebarEventListeners(panel) {
    const closeBtn = panel.querySelector('#close-sidebar');
    const refreshBtn = panel.querySelector('#refresh-context');
    const generateBtn = panel.querySelector('#generate-email');
    const pasteBtn = panel.querySelector('#paste-email');
    const inputArea = panel.querySelector('#sidebar-input');
    const outputDiv = panel.querySelector('#sidebar-output');
    const analysisDiv = panel.querySelector('#sidebar-analysis');
    
    closeBtn.addEventListener('click', unmountSidebar);
    
    refreshBtn.addEventListener('click', () => {
      const emailContext = extractGmailThreadText();
      updateAnalysisSection(analysisDiv, emailContext);
    });
    
    generateBtn.addEventListener('click', async () => {
      const userInput = inputArea.value.trim();
      if (!userInput) {
        alert('Vul eerst in wat je wil schrijven');
        return;
      }
      
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="mailsprint-btn-icon">⏳</span>Genereren...';
      
      try {
        const emailContext = extractGmailThreadText();
        const fullContext = {
          userInput: userInput,
          userEmail: emailContext.userEmail, // De Gmail gebruiker die de reply schrijft
          subject: emailContext.subject,
          from: emailContext.from, // Degene die het laatste bericht stuurde
          threadContext: emailContext.fullThread,
          messageCount: emailContext.messageCount,
          isReply: emailContext.isReply
        };

        const response = await fetchWithFallback(`${API_BASE_URL}/api/generateMail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context: JSON.stringify(fullContext) })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || `HTTP ${response.status}: Failed to generate email`);
        }

        const data = await response.json();
        
        outputDiv.innerHTML = `
          <div class="mailsprint-generated-email">
            <pre class="mailsprint-email-text">${data.email}</pre>
          </div>
        `;
        
        pasteBtn.style.display = 'flex';
        
      } catch (error) {
        outputDiv.innerHTML = `
          <div class="mailsprint-error">
            <span class="mailsprint-error-icon">⚠️</span>
            <p>${error.message}</p>
          </div>
        `;
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="mailsprint-btn-icon">✨</span>Genereer Email';
      }
    });
    
    const openRefBtn = panel.querySelector('#open-reference-emails');
    if (openRefBtn) {
      openRefBtn.addEventListener('click', () => {
        try {
          const target = `${APP_URL}/dashboard/reference-emails`;
          window.open(target, '_blank');
        } catch (_) {
          // no-op
        }
      });
    }

    pasteBtn.addEventListener('click', () => {
      const emailText = outputDiv.querySelector('.mailsprint-email-text')?.textContent;
      if (!emailText) return;
      
      const editor = document.querySelector('[g_editable="true"], div[aria-label="Message Body"], div[role="textbox"]');
      if (editor) {
        editor.focus();
        editor.innerText = emailText;
        const inputEvent = new Event('input', { bubbles: true });
        editor.dispatchEvent(inputEvent);
        
        // Show feedback
        pasteBtn.innerHTML = '<span class="mailsprint-btn-icon">✓</span>Geplakt!';
        setTimeout(() => {
          pasteBtn.innerHTML = '<span class="mailsprint-btn-icon">📋</span>Plak in Gmail';
        }, 2000);
      }
    });
  }

  function updateAnalysisSection(analysisDiv, emailContext) {
    analysisDiv.innerHTML = emailContext.hasThread ? `
      <div class="mailsprint-context-card">
        ${emailContext.userEmail ? `
          <div class="mailsprint-context-item">
            <span class="mailsprint-context-label">✍️ Jij (afzender):</span>
            <span class="mailsprint-context-value">${emailContext.userEmail}</span>
          </div>
        ` : ''}
        <div class="mailsprint-context-item">
          <span class="mailsprint-context-label">📧 Onderwerp:</span>
          <span class="mailsprint-context-value">${emailContext.subject || 'Geen onderwerp'}</span>
        </div>
        ${emailContext.from ? `
          <div class="mailsprint-context-item">
            <span class="mailsprint-context-label">👤 Van (ontvangen van):</span>
            <span class="mailsprint-context-value">${emailContext.from}</span>
          </div>
        ` : ''}
        <div class="mailsprint-context-item">
          <span class="mailsprint-context-label">📬 Laatste bericht:</span>
          <div class="mailsprint-context-text">${emailContext.lastMessage}</div>
        </div>
        <div class="mailsprint-context-item">
          <span class="mailsprint-context-label">💬 Berichten:</span>
          <span class="mailsprint-context-value">${emailContext.messageCount} in thread</span>
        </div>
      </div>
    ` : `
      <div class="mailsprint-empty-state">
        <span class="mailsprint-empty-icon">📭</span>
        <p>Geen thread gevonden</p>
        <p class="mailsprint-empty-hint">Open een email of reply om context te zien</p>
      </div>
    `;
  }

  function unmountSidebar() {
    const el = document.getElementById(SIDEBAR_ID);
    if (el) el.remove();
  }

  // Message from background to toggle
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'MAILSPRINT_TOGGLE') {
      if (document.getElementById(SIDEBAR_ID)) {
        unmountSidebar();
      } else {
        mountSidebar();
      }
    }
  });

  function extractGmailThreadText() {
    const context = {
      hasThread: false,
      subject: '',
      from: '',
      lastMessage: '',
      fullThread: '',
      messageCount: 0,
      userEmail: '', // Gmail account van de gebruiker
      isReply: false
    };

    // Get current Gmail user (the person who is logged in)
    const userEmailEl = document.querySelector('[data-hovercard-id]') || 
                        document.querySelector('div[aria-label*="Google Account"] img') ||
                        document.querySelector('[email]');
    
    // Try to get from profile button
    const profileButton = document.querySelector('a[aria-label*="Google"][href*="SignOutOptions"]');
    if (profileButton) {
      const emailMatch = profileButton.getAttribute('aria-label')?.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) context.userEmail = emailMatch[0];
    }
    
    // Fallback: try to get from compose "from" field
    if (!context.userEmail) {
      const fromField = document.querySelector('[name="from"]') || 
                       document.querySelector('.wO[email]');
      if (fromField) {
        context.userEmail = fromField.getAttribute('email') || fromField.value || '';
      }
    }

    // Get subject
    const subjectEl = document.querySelector('h2.hP') || document.querySelector('[data-legacy-thread-id] h2');
    if (subjectEl) {
      context.subject = subjectEl.textContent.trim();
    }

    // Get email messages in thread
    const messages = document.querySelectorAll('[data-message-id]');
    context.messageCount = messages.length;

    if (messages.length > 0) {
      context.hasThread = true;
      context.isReply = true; // Dit is een reply op een bestaande thread
      
      // Get last message (the one we're replying to)
      const lastMessage = messages[messages.length - 1];
      const fromEl = lastMessage.querySelector('.gD') || lastMessage.querySelector('[email]');
      if (fromEl) {
        context.from = fromEl.getAttribute('email') || fromEl.textContent.trim();
      }
      
      const bodyEl = lastMessage.querySelector('.a3s');
      if (bodyEl) {
        const clone = bodyEl.cloneNode(true);
        // Remove quoted text
        clone.querySelectorAll('.gmail_quote, blockquote').forEach(q => q.remove());
        const text = clone.textContent.trim();
        context.lastMessage = text.slice(0, 200) + (text.length > 200 ? '...' : '');
        context.fullThread = text.slice(0, 2000);
      }
    }

    return context;
  }
})();

// Development/local API endpoint
const API_URL = 'http://localhost:3000';

console.log('🚀 MailSprint content.js loaded!', window.location.href);

function init() {
  console.log('✅ MailSprint init() called');
  if (window.location.href.includes('mail.google.com')) {
    console.log('✅ Gmail detected, setting up...');
    observeComposeWindows();
    setupKeyboardShortcut();
  } else {
    console.log('❌ Not Gmail:', window.location.href);
  }
}

function setupKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      const composeWindow = document.querySelector('.nH.Hd');
      const bodyDiv = composeWindow?.querySelector('[role="textbox"][g_editable="true"]');
      
      if (composeWindow && bodyDiv) {
        e.preventDefault();
        e.stopPropagation();
        showOverlay(composeWindow, bodyDiv);
      }
    }
  });
}

function showOverlay(dialog, bodyDiv) {
  if (document.querySelector('.mailsprint-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'mailsprint-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'mailsprint-modal';
  
  const emailContext = extractEmailContext(dialog);
  
  let contextInfo = '';
  if (emailContext.subject) contextInfo += `📧 ${emailContext.subject}\n`;
  if (emailContext.recipientEmail) contextInfo += `👤 ${emailContext.recipientEmail}\n`;
  if (emailContext.threadContext) contextInfo += `\n📬 Laatste bericht:\n${emailContext.threadContext.slice(0, 150)}...\n`;
  
  modal.innerHTML = `
    <div class="mailsprint-header">
      <h3>✨ MailSprint AI</h3>
      <button class="mailsprint-close">×</button>
    </div>
    ${contextInfo ? `<pre class="mailsprint-context">${contextInfo}</pre>` : ''}
    <textarea class="mailsprint-input" placeholder="Wat wil je schrijven? Geef context of instructies..." rows="4" autofocus></textarea>
    <div class="mailsprint-actions">
      <button class="mailsprint-cancel">Annuleren (ESC)</button>
      <button class="mailsprint-generate">Genereer (Enter)</button>
    </div>
    <div class="mailsprint-loading" style="display: none;">⏳ Genereren...</div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  const input = modal.querySelector('.mailsprint-input');
  const generateBtn = modal.querySelector('.mailsprint-generate');
  const cancelBtn = modal.querySelector('.mailsprint-cancel');
  const closeBtn = modal.querySelector('.mailsprint-close');
  const loadingDiv = modal.querySelector('.mailsprint-loading');
  
  function closeOverlay() {
    overlay.remove();
  }
  
  async function generate() {
    const userContext = input.value.trim();
    if (!userContext) return;
    
    modal.style.opacity = '0.5';
    modal.style.pointerEvents = 'none';
    loadingDiv.style.display = 'block';
    
    try {
      const fullContext = {
        userInput: userContext,
        subject: emailContext.subject,
        recipientEmail: emailContext.recipientEmail,
        threadContext: emailContext.threadContext
      };

      const response = await fetchWithFallback(`${API_URL}/api/generateMail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: JSON.stringify(fullContext) })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP ${response.status}: Failed to generate email`);
      }

      const data = await response.json();
      
      bodyDiv.focus();
      bodyDiv.innerText = data.email;
      
      const inputEvent = new Event('input', { bubbles: true });
      bodyDiv.dispatchEvent(inputEvent);
      
      closeOverlay();
      
    } catch (error) {
      alert(`Fout: ${error.message}`);
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      loadingDiv.style.display = 'none';
    }
  }
  
  generateBtn.addEventListener('click', generate);
  cancelBtn.addEventListener('click', closeOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generate();
    }
    if (e.key === 'Escape') {
      closeOverlay();
    }
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });
  
  setTimeout(() => input.focus(), 100);
}

function extractEmailContext(dialog) {
  const context = {
    subject: '',
    recipientEmail: '',
    threadContext: '',
    existingBody: ''
  };

  const subjectInput = dialog.querySelector('input[name="subjectbox"]');
  if (subjectInput) {
    context.subject = subjectInput.value || '';
  }

  const toField = dialog.querySelector('[name="to"]');
  if (toField) {
    context.recipientEmail = toField.value || '';
  }

  const bodyDiv = dialog.querySelector('[role="textbox"][g_editable="true"]');
  if (bodyDiv) {
    context.existingBody = bodyDiv.innerText || '';
  }

  const threadEmails = document.querySelectorAll('[data-message-id]');
  if (threadEmails.length > 1) {
    const lastEmail = threadEmails[threadEmails.length - 2];
    const bodyElement = lastEmail?.querySelector('[data-message-id] .a3s');
    if (bodyElement) {
      context.threadContext = bodyElement.innerText.slice(0, 500);
    }
  }

  return context;
}

function observeComposeWindows() {
  const observer = new MutationObserver((mutations) => {
    const composeWindows = document.querySelectorAll('.nH.Hd');
    
    composeWindows.forEach((dialog) => {
      if (!dialog.querySelector('.mailsprint-button')) {
        addMailSprintButton(dialog);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  const existingDialogs = document.querySelectorAll('.nH.Hd');
  existingDialogs.forEach(addMailSprintButton);
}

function addMailSprintButton(dialog) {
  const toolbar = dialog.querySelector('[role="toolbar"]');
  if (!toolbar) return;

  const button = document.createElement('button');
  button.className = 'mailsprint-button';
  button.innerHTML = '✨ MailSprint AI';
  button.title = 'Genereer e-mail met AI (Cmd+M)';
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bodyDiv = dialog.querySelector('[role="textbox"][g_editable="true"]');
    if (!bodyDiv) {
      alert('Kan e-mail veld niet vinden');
      return;
    }

    showOverlay(dialog, bodyDiv);
  });

  toolbar.appendChild(button);
}

init();
