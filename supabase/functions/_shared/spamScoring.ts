// Contact-form spam scoring rules. Kept in one module, deliberately dumb and
// tunable — thresholds and keyword list live here, not scattered through the
// handler. See supabase/functions/contact-submit/index.ts for how forced
// rejections (honeypot, rate limit, bad token) combine with this score.

export const SPAM_KEYWORDS = [
  'seo service',
  'seo services',
  'backlink',
  'link building',
  'guest post',
  'we can rank your site',
  'increase your ranking',
  'improve your ranking',
  'crypto',
  'forex',
  'bitcoin',
];

export interface ScoreInput {
  name: string;
  subject: string | null;
  message: string;
  referer: string | null;
  allowedRefererHosts: string[];
  dwellMs: number | null;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function looksRandomAlpha(word: string): boolean {
  if (!/^[A-Za-z]{5,}$/.test(word)) return false;
  if (!/[aeiouAEIOU]/.test(word)) return true; // no vowels at all
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) return true; // 4+ consonants in a row
  return false;
}

function hasRandomLookingToken(value: string): boolean {
  return value.split(/\s+/).some((token) => looksRandomAlpha(token));
}

function isMixedCaseNoSpace(value: string): boolean {
  return value.length >= 8 && !/\s/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value);
}

export function scoreContent(input: ScoreInput): ScoreResult {
  const { name, subject, message, referer, allowedRefererHosts, dwellMs } = input;
  const reasons: string[] = [];
  let score = 0;

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 0 && /^[\d\s]+$/.test(trimmedMessage)) {
    score += 60;
    reasons.push('digits_only_message');
  }

  const urlCount = (message.match(/https?:\/\/\S+|www\.\S+/gi) ?? []).length;
  if (urlCount >= 3) {
    score += 40;
    reasons.push('too_many_urls');
  }

  if (/\[url=|\[link=/i.test(message)) {
    score += 60;
    reasons.push('bbcode');
  }

  if (hasRandomLookingToken(name) || (subject && hasRandomLookingToken(subject))) {
    score += 25;
    reasons.push('random_alpha_string');
  }

  if (subject && isMixedCaseNoSpace(name) && isMixedCaseNoSpace(subject)) {
    score += 25;
    reasons.push('mixed_case_no_space');
  }

  const lowerMessage = message.toLowerCase();
  if (SPAM_KEYWORDS.some((k) => lowerMessage.includes(k))) {
    score += 30;
    reasons.push('spam_keyword');
  }

  if (!referer) {
    score += 20;
    reasons.push('referer_missing');
  } else {
    try {
      const host = new URL(referer).hostname;
      if (!allowedRefererHosts.includes(host)) {
        score += 20;
        reasons.push('referer_off_domain');
      }
    } catch {
      score += 20;
      reasons.push('referer_unparseable');
    }
  }

  if (dwellMs !== null) {
    if (dwellMs < 2500) {
      score += 40;
      reasons.push('dwell_too_fast');
    } else if (dwellMs > DAY_MS) {
      // Largely unreachable given the 30-minute submission-token TTL, kept
      // for spam_reasons completeness and in case the token check ever
      // changes.
      score += 20;
      reasons.push('dwell_stale');
    }
  }

  return { score, reasons };
}

export function emailDotCount(email: string): number {
  const local = email.split('@')[0] ?? '';
  return (local.match(/\./g) ?? []).length;
}
