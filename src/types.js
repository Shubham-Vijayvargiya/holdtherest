/**
 * User Profile definition
 */
export const USERS = {
  SHUBH: {
    id: 'user_shubh',
    name: 'Shubh',
    email: 'shubh@gmail.com',
    avatar: '👨‍💻',
    partnerEmail: 'spouse@gmail.com'
  }
};

/**
 * Task Category types
 */
export const CATEGORIES = {
  MUST: 'must_do',
  SHOULD: 'should_do',
  NICE: 'nice_to_have',
  UNASSIGNED: 'unassigned'
};

export const CATEGORY_CONFIG = {
  [CATEGORIES.MUST]: {
    label: 'Must Do',
    description: 'Non-negotiable tasks for today',
    color: 'var(--must-color)',
    bg: 'var(--must-bg)',
    border: 'var(--must-border)',
    badgeClass: 'must-badge'
  },
  [CATEGORIES.SHOULD]: {
    label: 'Should Do',
    description: 'Important, but lower stress',
    color: 'var(--should-color)',
    bg: 'var(--should-bg)',
    border: 'var(--should-border)',
    badgeClass: 'should-badge'
  },
  [CATEGORIES.NICE]: {
    label: 'Nice to Have',
    description: 'Bonus items if you have energy',
    color: 'var(--nice-color)',
    bg: 'var(--nice-bg)',
    border: 'var(--nice-border)',
    badgeClass: 'nice-badge'
  },
  [CATEGORIES.UNASSIGNED]: {
    label: 'Quick Dump / Inbox',
    description: 'Unsorted brain dump items',
    color: 'var(--text-muted)',
    bg: 'var(--bg-subtle)',
    border: 'var(--border-light)',
    badgeClass: 'unassigned-badge'
  }
};
