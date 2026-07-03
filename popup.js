const ul = document.getElementById('filters');
for (const f of DP_FILTERS) {
  const li = document.createElement('li');
  const lbl = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.dataset.filter = f.key;
  const span = document.createElement('span');
  span.textContent = f.label;
  if (f.hint) {
    const small = document.createElement('small');
    small.textContent = f.hint;
    span.appendChild(small);
  }
  lbl.append(input, span);
  li.appendChild(lbl);
  ul.appendChild(li);
}

const checkboxes = document.querySelectorAll('input[data-filter]');

chrome.storage.sync.get(DP_DEFAULTS, (filters) => {
  for (const box of checkboxes) {
    box.checked = filters[box.dataset.filter];
  }
});

for (const box of checkboxes) {
  box.addEventListener('change', () => {
    chrome.storage.sync.set({ [box.dataset.filter]: box.checked });
  });
}

const status = document.getElementById('harvest-status');

document.getElementById('harvest').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const res = await chrome.tabs.sendMessage(tab.id, DP_HARVEST_MSG);
    status.textContent = `${res.count} posts exported`;
  } catch {
    status.textContent = 'Open a LinkedIn feed tab first';
  }
});
