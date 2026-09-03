import type {
  EmailResult,
  MeetingResult,
  PlannerResult,
  Settings,
  Tone,
  MeetingFormat,
  Priority,
} from '@/types';

export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIError';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock generators — produce realistic output without any API call   */
/* ------------------------------------------------------------------ */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toneMap: Record<Tone, { opener: string; closer: string }> = {
  professional: { opener: 'I hope this message finds you well.', closer: 'Best regards,' },
  friendly: { opener: "Hope you're having a great day!", closer: 'Cheers,' },
  concise: { opener: '', closer: 'Thanks,' },
  apologetic: { opener: 'Thank you for your patience.', closer: 'Sincerely,' },
  persuasive: { opener: "I wanted to share something I think you'll find valuable.", closer: 'Warmly,' },
};

function mockEmail(
  topic: string,
  recipient: string,
  tone: Tone,
  keyPoints: string,
): EmailResult {
  const t = toneMap[tone];
  const points = keyPoints
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bodyParts: string[] = [];
  if (t.opener) bodyParts.push(t.opener);
  bodyParts.push('');
  bodyParts.push(`I'm writing about ${topic.toLowerCase()}.`);
  if (points.length) {
    bodyParts.push('');
    bodyParts.push('Key points:');
    points.forEach((p) => bodyParts.push(`  • ${p}`));
  }
  bodyParts.push('');
  bodyParts.push("I'd love to hear your thoughts when you have a moment.");
  bodyParts.push('');
  bodyParts.push(t.closer);
  bodyParts.push('[Your Name]');

  return {
    subject: topic.slice(0, 60) || 'Quick update',
    body: bodyParts.join('\n'),
  };
}

function mockMeeting(transcript: string, format: MeetingFormat): MeetingResult {
  const lines = transcript
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const summary =
    lines.slice(0, 2).join(' ') ||
    'The team discussed project status, identified blockers, and agreed on next steps.';

  const keyPoints = lines.slice(0, 5).length
    ? lines.slice(0, 5)
    : ['Project on track for Q3 delivery', 'Budget approved for new tooling', 'Two blockers identified'];

  return {
    summary,
    keyPoints,
    decisions: ['Proceed with the proposed timeline', 'Allocate additional resources to Phase 2'],
    actionItems: [
      { task: 'Draft technical spec', owner: 'Alex', due: 'Friday' },
      { task: 'Send budget approval to finance', owner: 'Jordan', due: 'Wednesday' },
      { task: 'Schedule design review', owner: 'Sam', due: 'Next Monday' },
    ],
  };
}

function mockPlanner(rawTasks: string): PlannerResult {
  const lines = rawTasks
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const priorities: Priority[] = ['high', 'medium', 'low'];
  const categories = ['Focus', 'Admin', 'Communication', 'Review'];
  const durations = ['25 min', '45 min', '1 hr', '90 min'];

  const tasks = (lines.length ? lines : ['Review project proposal', 'Reply to client thread', 'Prepare slides for Monday']).map(
    (title, i) => ({
      title,
      priority: priorities[i % 3],
      duration: durations[i % durations.length],
      category: categories[i % categories.length],
      notes: '',
    }),
  );

  return {
    tasks,
    schedule:
      'Morning: High-priority focus block (90 min)\nMidday: Admin & communication batch (45 min)\nAfternoon: Deep work on Phase 2 (60 min)',
    tips: [
      'Tackle your highest-priority task first when energy is highest.',
      'Batch small admin tasks into one 30-minute window.',
      'Leave 15-minute buffers between deep-work blocks.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  OpenAI-compatible chat completion                                  */
/* ------------------------------------------------------------------ */

async function callOpenAI(
  settings: Settings,
  system: string,
  user: string,
): Promise<string> {
  if (!settings.apiKey) {
    throw new AIError('No API key configured. Open Settings to add one.');
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new AIError(`OpenAI request failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/* ------------------------------------------------------------------ */
/*  Public API — dispatches to mock or OpenAI based on settings       */
/* ------------------------------------------------------------------ */

export async function generateEmail(
  settings: Settings,
  input: { topic: string; recipient: string; tone: Tone; keyPoints: string },
): Promise<EmailResult> {
  if (settings.provider === 'mock') {
    await wait(900);
    return mockEmail(input.topic, input.recipient, input.tone, input.keyPoints);
  }

  const system =
    'You are an expert email writer. Return ONLY valid JSON with "subject" and "body" keys. The body should use \\n for line breaks.';
  const user = `Write an email about: "${input.topic}"\nTo: ${input.recipient || 'colleague'}\nTone: ${input.tone}\nKey points:\n${input.keyPoints}`;
  const raw = await callOpenAI(settings, system, user);
  try {
    return JSON.parse(raw);
  } catch {
    return { subject: input.topic.slice(0, 60), body: raw };
  }
}

export async function summarizeMeeting(
  settings: Settings,
  input: { transcript: string; format: MeetingFormat },
): Promise<MeetingResult> {
  if (settings.provider === 'mock') {
    await wait(1200);
    return mockMeeting(input.transcript, input.format);
  }

  const system =
    'You are a meeting summarizer. Return ONLY valid JSON with keys: "summary" (string), "keyPoints" (string[]), "decisions" (string[]), "actionItems" (array of {task, owner, due}).';
  const user = `Summarize this meeting transcript in ${input.format} format:\n${input.transcript}`;
  const raw = await callOpenAI(settings, system, user);
  return JSON.parse(raw);
}

export async function planTasks(
  settings: Settings,
  input: { rawTasks: string },
): Promise<PlannerResult> {
  if (settings.provider === 'mock') {
    await wait(1000);
    return mockPlanner(input.rawTasks);
  }

  const system =
    'You are a productivity planner. Return ONLY valid JSON with keys: "tasks" (array of {title, priority: "low"|"medium"|"high", duration, category, notes}), "schedule" (string), "tips" (string[]).';
  const user = `Plan and prioritize these tasks:\n${input.rawTasks}`;
  const raw = await callOpenAI(settings, system, user);
  return JSON.parse(raw);
}
