import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { emailDotCount, scoreContent } from './spamScoring.ts';

const base = {
  referer: 'https://whataline.com/contact',
  allowedRefererHosts: ['whataline.com'],
  dwellMs: 5000,
};

Deno.test('scores the observed reconnaissance spam pattern at or above the spam threshold', () => {
  // Real pattern from the bot traffic this feature exists to stop: random
  // name/subject, numeric-only body.
  const { score, reasons } = scoreContent({
    ...base,
    name: 'Hgmcjrq Totkx',
    subject: 'CDEIYaPDwpuLxTfRZONrx',
    message: '4608425571',
  });
  assert(score >= 60, `expected score >= 60, got ${score} (${reasons.join(', ')})`);
  assert(reasons.includes('digits_only_message'));
});

Deno.test('digits-only message scores +60', () => {
  const { score, reasons } = scoreContent({ ...base, name: 'Jamie Rollinson', subject: null, message: '123456789' });
  assertEquals(score, 60);
  assertEquals(reasons, ['digits_only_message']);
});

Deno.test('three or more URLs scores +40', () => {
  const message = 'Check http://a.com and http://b.com and http://c.com for details on our services thanks';
  const { score, reasons } = scoreContent({ ...base, name: 'Jamie Rollinson', subject: null, message });
  assertEquals(score, 40);
  assertEquals(reasons, ['too_many_urls']);
});

Deno.test('BBCode markup scores +60', () => {
  const { score, reasons } = scoreContent({
    ...base,
    name: 'Jamie Rollinson',
    subject: null,
    message: 'Great site [url=http://spam.example]click here[/url] for more',
  });
  assertEquals(score, 60);
  assertEquals(reasons, ['bbcode']);
});

Deno.test('a legitimate enquiry scores low and clears the quarantine threshold', () => {
  const { score } = scoreContent({
    ...base,
    name: 'Jamie Rollinson',
    subject: 'Script supervision enquiry',
    message: 'Hi Kat, I loved your latest short and would love to talk about an upcoming shoot in March.',
  });
  assert(score < 30, `expected a clean score, got ${score}`);
});

Deno.test('missing referer scores +20', () => {
  const { score, reasons } = scoreContent({
    name: 'Jamie Rollinson',
    subject: null,
    message: 'Hello there, I would like to get in touch about a project.',
    referer: null,
    allowedRefererHosts: ['whataline.com'],
    dwellMs: 5000,
  });
  assertEquals(score, 20);
  assertEquals(reasons, ['referer_missing']);
});

Deno.test('dwell time under 2.5s scores +40', () => {
  const { score, reasons } = scoreContent({
    ...base,
    name: 'Jamie Rollinson',
    subject: null,
    message: 'Hello there, I would like to get in touch about a project.',
    dwellMs: 400,
  });
  assertEquals(score, 40);
  assertEquals(reasons, ['dwell_too_fast']);
});

Deno.test('emailDotCount counts dots in the local part only', () => {
  assertEquals(emailDotCount('k.ige.gu.r.a.v.i.f9.0.8@gmail.com'), 8);
  assertEquals(emailDotCount('jamie.rollinson@example.com'), 1);
  assertEquals(emailDotCount('nodotshere@example.com'), 0);
});
