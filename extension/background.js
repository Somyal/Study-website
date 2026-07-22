const FOCUS_ACTIVE_RULE_ID = 1;
const REDIRECT_RULE_ID = 2;

const BLOCKED_HOSTS = [
  '*.instagram.com',
  '*.discord.com',
  '*.reddit.com',
  '*.x.com',
  '*.twitter.com',
  '*.youtube.com',
];

function buildBlockRules() {
  return BLOCKED_HOSTS.map((host) => ({
    id: FOCUS_ACTIVE_RULE_ID,
    priority: 1,
    action: { type: 'block' },
    condition: { resourceTypes: ['main_frame'], domains: [host] },
  }));
}

function buildRedirectRules() {
  return BLOCKED_HOSTS.map((host) => ({
    id: REDIRECT_RULE_ID,
    priority: 2,
    action: {
      type: 'redirect',
      redirect: { url: chrome.runtime.getURL('focus-block.html') },
    },
    condition: { resourceTypes: ['main_frame'], domains: [host], regexFilter: '.*' },
  }));
}

async function updateRules(active) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((r) => r.id);

  if (!active) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds });
    return;
  }

  const rules = [...buildBlockRules(), ...buildRedirectRules()];
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules: rules });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'FOCUS_STATUS') {
    updateRules(!!msg.active);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const host = new URL(tab.url).hostname.replace(/^www\./, '');
    const blockedPatterns = ['instagram.com', 'discord.com', 'reddit.com', 'x.com', 'twitter.com', 'youtube.com'];
    if (blockedPatterns.some((p) => host.includes(p))) {
      chrome.tabs.sendMessage(tabId, { type: 'URL_CHECK' });
    }
  }
});