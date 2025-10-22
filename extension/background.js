chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-sidebar') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, url: ['https://mail.google.com/*'] });
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'MAILSPRINT_TOGGLE' });
  } catch (e) {
    // content script might not be injected yet; try to inject it then send again
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      await chrome.tabs.sendMessage(tab.id, { type: 'MAILSPRINT_TOGGLE' });
    } catch (_) {}
  }
});


