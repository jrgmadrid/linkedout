const apiKey = document.getElementById('apiKey');
const apiBase = document.getElementById('apiBase');
const model = document.getElementById('model');
const status = document.getElementById('status');

chrome.storage.local.get(DP_JUDGE_CFG, ({ [DP_JUDGE_CFG]: c }) => {
  if (!c) return;
  apiKey.value = c.apiKey || '';
  apiBase.value = c.apiBase || '';
  model.value = c.model || '';
});

document.getElementById('save').addEventListener('click', () => {
  const key = apiKey.value.trim();
  if (!key) {
    chrome.storage.local.remove(DP_JUDGE_CFG);
    status.textContent = 'Key cleared — file fallback applies, if present.';
    return;
  }
  chrome.storage.local.set({
    [DP_JUDGE_CFG]: {
      apiKey: key,
      apiBase: apiBase.value.trim(),
      model: model.value.trim(),
    },
  });
  status.textContent = 'Saved.';
});

// The options page floats over chrome://extensions, so "the active tab" is
// never LinkedIn — find a LinkedIn tab explicitly (host permission granted).
const harvestStatus = document.getElementById('harvest-status');
document.getElementById('harvest').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
  const tab = tabs.find((t) => t.active) || tabs[0];
  if (!tab) {
    harvestStatus.textContent = 'Open a LinkedIn feed tab first.';
    return;
  }
  try {
    const res = await chrome.tabs.sendMessage(tab.id, DP_HARVEST_MSG);
    harvestStatus.textContent = `${res.count} posts exported.`;
  } catch {
    harvestStatus.textContent = 'That LinkedIn tab needs a refresh first.';
  }
});

// One real judge call on a canned slop snippet — fail-open hides broken
// keys everywhere else, so this is the only place errors get to speak.
document.getElementById('test').addEventListener('click', async () => {
  status.textContent = 'Judging a test post…';
  try {
    const res = await chrome.runtime.sendMessage({ type: DP_JUDGE_TEST });
    status.textContent = res.ok
      ? `Working — the judge scored the test post ${res.score}/100.`
      : `Failed: ${res.error}`;
  } catch {
    status.textContent = 'Failed: no response from the worker.';
  }
});
