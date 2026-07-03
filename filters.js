const DP_HARVEST_MSG = 'dp-harvest';

const DP_FILTERS = [
  { key: 'promoted',  label: 'Promoted posts',      hint: null,                            reasonLabel: 'Promoted',           pattern: null,                                                         enabled: true  },
  { key: 'reactions', label: 'Reaction spillover',  hint: '"Jane Doe likes this"',         reasonLabel: 'Reaction spillover', pattern: /(?:likes|loves|celebrates|supports|finds) this|reacted to/,  enabled: false },
  // No trailing \b on comments/reposts/follows: the DOM concatenates text nodes
  // without whitespace, so the verb runs straight into the author's name
  // ("commentedMikey Taylor").
  { key: 'comments',  label: 'Comment spillover',   hint: '"Jane Doe commented"',          reasonLabel: 'Comment spillover',  pattern: /\bcommented|\breplied/,                                      enabled: false },
  { key: 'reposts',   label: 'Reposts',             hint: '"Jane Doe reposted this"',      reasonLabel: 'Repost',             pattern: /\breposted/,                                                 enabled: false },
  { key: 'follows',   label: 'Follow spillover',    hint: '"Jane Doe follows Acme Corp"',  reasonLabel: 'Follow spillover',   pattern: /\bfollows/,                                                  enabled: false },
  { key: 'suggested', label: 'Suggested posts',     hint: '"Recommended for you"',         reasonLabel: 'Suggested post',     pattern: /suggested for you|recommended for you/i,                    enabled: false },
];

const DP_DEFAULTS = Object.fromEntries(DP_FILTERS.map((f) => [f.key, f.enabled]));
