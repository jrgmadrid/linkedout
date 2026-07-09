// Sections come from the registry (DP_SECTIONS + each row's section key),
// so a new filter row lands in the right group without touching this file.
// Within a section, slophide rows render as the "Hide chipped posts"
// subgroup; everything else is a plain row.
const GROUPS = DP_SECTIONS.map((s) => {
  const rows = DP_FILTERS.filter((f) => f.section === s.key);
  const chipHides = rows.filter((f) => f.mode === 'slophide');
  return {
    title: s.title,
    rows: rows.filter((f) => f.mode !== 'slophide'),
    sub: chipHides.length ? { title: 'Hide chipped posts', rows: chipHides } : null,
  };
});

function buildRow(f) {
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
  return li;
}

const main = document.getElementById('sections');
for (const g of GROUPS) {
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.textContent = g.title;
  const ul = document.createElement('ul');
  for (const f of g.rows) ul.appendChild(buildRow(f));
  section.append(h2, ul);
  if (g.sub) {
    const h3 = document.createElement('h3');
    h3.textContent = g.sub.title;
    const subUl = document.createElement('ul');
    subUl.className = 'sub';
    for (const f of g.sub.rows) subUl.appendChild(buildRow(f));
    section.append(h3, subUl);
  }
  main.appendChild(section);
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

// The worker's onInstalled listener refreshes LinkedIn tabs once the new
// version boots, so this one call is the whole dev loop.
document.getElementById('reload').addEventListener('click', () => {
  chrome.runtime.reload();
});

document.getElementById('harvest').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const res = await chrome.tabs.sendMessage(tab.id, DP_HARVEST_MSG);
    status.textContent = `${res.count} posts exported`;
  } catch {
    status.textContent = 'Open a LinkedIn feed tab first';
  }
});
