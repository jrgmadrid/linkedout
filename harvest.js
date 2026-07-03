// Temporary debug harvester, v3: targeted at LinkedIn's new frontend
// (hashed classes, componentkey/data-testid hooks). Dumps per-post structure
// from div[role=listitem] feed items. Triggered from the popup; remove once
// detection signals are locked.

function harvestListItem(li) {
  const clean = (text) => text.trim().replace(/\s+/g, ' ');

  let promotedLeaf = null;
  for (const el of li.querySelectorAll('p, span')) {
    if (el.childElementCount === 0 && /^(Promoted|Sponsored)$/.test(el.textContent.trim())) {
      promotedLeaf = el.textContent.trim();
      break;
    }
  }

  return {
    componentkey: li.getAttribute('componentkey'),
    headText: clean(li.textContent).slice(0, 260),
    promoted: promotedLeaf,
    testids: [...li.querySelectorAll('[data-testid]')]
      .slice(0, 40)
      .map((el) => el.getAttribute('data-testid')),
    componentkeys: [...li.querySelectorAll('[componentkey]')]
      .slice(0, 50)
      .map((el) => el.getAttribute('componentkey').slice(0, 100)),
    ariaLabels: [...li.querySelectorAll('[aria-label]')]
      .slice(0, 15)
      .map((el) => el.getAttribute('aria-label').slice(0, 100)),
  };
}

function testidCensus() {
  const counts = {};
  for (const el of document.querySelectorAll('[data-testid]')) {
    const id = el.getAttribute('data-testid');
    counts[id] = (counts[id] || 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 80)
  );
}

function dpHarvest() {
  const items = [...document.querySelectorAll('div[role="listitem"]')];
  const payload = {
    url: location.href,
    collectedAt: new Date().toISOString(),
    listItemCount: items.length,
    testidCensus: testidCensus(),
    posts: items.map(harvestListItem),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'li-feed-markers-v3.json';
  link.click();
  URL.revokeObjectURL(link.href);

  return items.length;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg !== DP_HARVEST_MSG) return;
  sendResponse({ count: dpHarvest() });
});
