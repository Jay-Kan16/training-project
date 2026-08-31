export const formatCurrency = (value = 0) => {
  const n = Number(value) || 0;
  const sign = n < 0 ? '-' : '';
  return `${sign}₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatCurrencyPrecise = (value = 0) => {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatRelativeDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export const formatFullDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

export const formatTimeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const AVATAR_COLORS = [
  '#6D5EF8', '#F4568C', '#22B07D', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6',
];

export const colorForName = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const initialsForName = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

const GROUP_KEYWORDS = [
  [/trip|goa|vacation|holiday|travel/i, '🏖️'],
  [/roommate|flat|house|home/i, '🏠'],
  [/friend/i, '👥'],
  [/office|work|colleague|team/i, '💼'],
  [/party|birthday|celebrat/i, '🎉'],
  [/college|hostel|class/i, '🎓'],
  [/food|dinner|lunch/i, '🍕'],
];
const GROUP_FALLBACK_EMOJI = ['🧾', '🎯', '🌟', '🧳', '🛍️', '🎮'];

export const getGroupEmoji = (name = '') => {
  const match = GROUP_KEYWORDS.find(([re]) => re.test(name));
  if (match) return match[1];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GROUP_FALLBACK_EMOJI[Math.abs(hash) % GROUP_FALLBACK_EMOJI.length];
};

const EXPENSE_CATEGORIES = [
  [/dinner|lunch|breakfast|food|restaurant|cafe|coffee|snack/i, { emoji: '🍽️', label: 'Food' }],
  [/cab|taxi|uber|ola|auto|train|flight|bus|fuel|petrol/i, { emoji: '🚗', label: 'Travel' }],
  [/hotel|stay|resort|airbnb|room/i, { emoji: '🏨', label: 'Stay' }],
  [/movie|ticket|game|concert|party|club/i, { emoji: '🎬', label: 'Entertainment' }],
  [/grocery|supermarket|market/i, { emoji: '🛒', label: 'Groceries' }],
  [/rent|electricity|bill|wifi|internet|utility/i, { emoji: '🧾', label: 'Bills' }],
  [/shop|shopping|clothes/i, { emoji: '🛍️', label: 'Shopping' }],
  [/medic|doctor|pharmacy|hospital/i, { emoji: '💊', label: 'Health' }],
];
const DEFAULT_CATEGORY = { emoji: '💳', label: 'Other' };

export const getExpenseCategory = (description = '') => {
  const match = EXPENSE_CATEGORIES.find(([re]) => re.test(description));
  return match ? match[1] : DEFAULT_CATEGORY;
};
