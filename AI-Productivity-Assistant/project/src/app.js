/* =========================================================
   Inkwell — AI-Powered Workplace Productivity Assistant
   Client-side app: tab routing, settings, provider calls,
   prompt templates, and result rendering.
========================================================= */

/* ---------- Settings (stored locally in the browser only) ---------- */
const Settings = {
  load() {
    return {
      provider: localStorage.getItem('inkwell_provider') || 'openai',
      apiKey: localStorage.getItem('inkwell_key') || '',
      model: localStorage.getItem('inkwell_model') || '',
    };
  },
  save({ provider, apiKey, model }) {
    localStorage.setItem('inkwell_provider', provider);
    localStorage.setItem('inkwell_key', apiKey);
    localStorage.setItem('inkwell_model', model);
  },
  clear() {
    localStorage.removeItem('inkwell_provider');
    localStorage.removeItem('inkwell_key');
    localStorage.removeItem('inkwell_model');
  }
};

const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash'
};

/* ---------- DOM refs ---------- */
const connectionStatus = document.getElementById('connectionStatus');
const settingsBtn = document.getElementById('settingsBtn');
const drawer = document.getElementById('settingsDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const closeDrawer = document.getElementById('closeDrawer');
const providerSelect = document.getElementById('providerSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const modelInput = document.getElementById('modelInput');
const modelHint = document.getElementById('modelHint');
const saveSettingsBtn = document.getElementById('saveSettings');
const clearSettingsBtn = document.getElementById('clearSettings');
const toast = document.getElementById('toast');

/* ---------- Init settings UI ---------- */
function refreshConnectionStatus() {
  const s = Settings.load();
  if (s.apiKey) {
    connectionStatus.dataset.state = 'on';
    connectionStatus.querySelector('.status-text').textContent =
      `Connected · ${s.provider === 'openai' ? 'OpenAI' : 'Gemini'}`;
  } else {
    connectionStatus.dataset.state = 'off';
    connectionStatus.querySelector('.status-text').textContent = 'No model connected';
  }
}

function openDrawer() {
  const s = Settings.load();
  providerSelect.value = s.provider;
  apiKeyInput.value = s.apiKey;
  modelInput.value = s.model || DEFAULT_MODELS[s.provider];
  modelHint.textContent = s.provider === 'openai'
    ? 'e.g. gpt-4o-mini, gpt-4o, or gpt-5-mini if available on your account.'
    : 'e.g. gemini-1.5-flash or gemini-2.0-flash, depending on your access.';
  drawer.classList.add('open');
  drawerBackdrop.classList.add('open');
}
function closeDrawerFn() {
  drawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
}
settingsBtn.addEventListener('click', openDrawer);
closeDrawer.addEventListener('click', closeDrawerFn);
drawerBackdrop.addEventListener('click', closeDrawerFn);

providerSelect.addEventListener('change', () => {
  modelInput.value = DEFAULT_MODELS[providerSelect.value];
  modelHint.textContent = providerSelect.value === 'openai'
    ? 'e.g. gpt-4o-mini, gpt-4o, or gpt-5-mini if available on your account.'
    : 'e.g. gemini-1.5-flash or gemini-2.0-flash, depending on your access.';
});

saveSettingsBtn.addEventListener('click', () => {
  const provider = providerSelect.value;
  const apiKey = apiKeyInput.value.trim();
  const model = modelInput.value.trim() || DEFAULT_MODELS[provider];
  if (!apiKey) {
    showToast('Paste an API key before saving.');
    return;
  }
  Settings.save({ provider, apiKey, model });
  refreshConnectionStatus();
  closeDrawerFn();
  showToast('Settings saved to this browser.');
});

clearSettingsBtn.addEventListener('click', () => {
  Settings.clear();
  apiKeyInput.value = '';
  refreshConnectionStatus();
  showToast('Saved key cleared.');
});

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- Tab routing ---------- */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tool).classList.add('active');
  });
});

/* =========================================================
   Provider adapters
   Both providers are called directly from the browser using
   the key the user pasted into Settings. Keys never touch
   any server we control.
========================================================= */
async function callModel(systemPrompt, userPrompt) {
  const { provider, apiKey, model } = Settings.load();
  if (!apiKey) throw new Error('MISSING_KEY');
  const chosenModel = model || DEFAULT_MODELS[provider];

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: chosenModel,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    if (!res.ok) {
      const errBody = await safeJson(res);
      throw new Error(errBody?.error?.message || `OpenAI request failed (${res.status})`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosenModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4 }
      })
    });
    if (!res.ok) {
      const errBody = await safeJson(res);
      throw new Error(errBody?.error?.message || `Gemini request failed (${res.status})`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ?? '';
  }

  throw new Error('Unknown provider');
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

/* Extract the first valid JSON object from a model response,
   even if the model wrapped it in markdown fences or prose. */
function extractJSON(text) {
  const cleaned = text.trim().replace(/^```json\s*|^```\s*|```$/gim, '');
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

/* ---------- Shared UI helpers ---------- */
function setLoading(outputEl) {
  outputEl.innerHTML = `<div class="output-loading"><span class="spinner"></span> Working on it…</div>`;
}
function setError(outputEl, message) {
  let friendly = message;
  if (message === 'MISSING_KEY') {
    friendly = 'No API key connected yet. Open Settings and paste one in.';
  }
  outputEl.innerHTML = `<div class="output-error">Couldn't generate a result: ${escapeHtml(friendly)}</div>`;
}
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = original), 1500);
  });
}
const DISCLAIMER = 'AI-generated draft. Check names, dates, figures, and commitments before you send, share, or act on this.';

/* =========================================================
   TOOL 1 — Smart Email Generator
========================================================= */
const EMAIL_SYSTEM_PROMPT = `You are a professional workplace writing assistant embedded in a tool called Inkwell.

TASK: Draft a workplace email from the context the user gives you.

RULES:
- Only use facts, names, and details the user actually provided. Never invent specifics (dates, figures, names) that weren't given — if something important is missing, write around it generically (e.g. "the new date") rather than making one up.
- Match the requested tone exactly:
  - formal: professional, precise, no contractions, respectful distance
  - informal: warm, conversational, contractions are fine, still professional
  - persuasive: leads with the benefit to the reader, confident, includes a clear call to action
- Adapt to the audience: a client email is polished and reassuring; a manager email is concise and leads with the ask/decision needed; a team email is direct and collaborative.
- Keep the email as short as it can be while covering the key points given.
- Do not add a generic disclaimer inside the email body itself.

OUTPUT FORMAT: Respond with ONLY a valid JSON object, no markdown fences, no commentary, matching exactly this shape:
{"subject": "string", "body": "string with \\n for line breaks, including a greeting and sign-off"}`;

document.getElementById('form-email').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const outputEl = document.getElementById('output-email');
  const data = new FormData(form);
  const context = data.get('context').trim();
  const audience = data.get('audience');
  const tone = data.get('tone');
  const points = data.get('points').trim();
  const sender = data.get('sender').trim();

  const userPrompt = `Context for the email: ${context}
Audience: ${audience}
Tone: ${tone}
Key points to include: ${points || '(none specified — infer only from the context above)'}
Sign off as: ${sender || '(no name given — use a neutral sign-off like "Best regards")'}`;

  setLoading(outputEl);
  try {
    const raw = await callModel(EMAIL_SYSTEM_PROMPT, userPrompt);
    const json = extractJSON(raw);
    if (!json || !json.body) throw new Error('The model returned a response Inkwell could not parse. Try again.');
    renderEmail(outputEl, json);
  } catch (err) {
    setError(outputEl, err.message);
  }
});

function renderEmail(outputEl, { subject, body }) {
  outputEl.innerHTML = `
    <div class="output-result">
      <h3>Subject</h3>
      <p>${escapeHtml(subject)}</p>
      <h3>Body</h3>
      <p>${escapeHtml(body)}</p>
      <div class="result-actions">
        <button data-action="copy">Copy email</button>
      </div>
      <div class="output-disclaimer">${DISCLAIMER}</div>
    </div>`;
  outputEl.querySelector('[data-action="copy"]').addEventListener('click', (e) => {
    copyText(`Subject: ${subject}\n\n${body}`, e.target);
  });
}

/* =========================================================
   TOOL 2 — Meeting Notes Summarizer
========================================================= */
const MEETING_SYSTEM_PROMPT = `You are a meticulous meeting-notes assistant embedded in a tool called Inkwell.

TASK: Turn raw, possibly messy meeting notes into a structured summary.

RULES:
- Base everything strictly on the notes given. Never invent an owner, deadline, or decision that isn't stated or clearly implied.
- If no owner is mentioned for an action item, set "owner" to "Unassigned". If no deadline is mentioned, set "deadline" to "Not specified".
- Keep the summary to 2-4 sentences covering the overall purpose and outcome of the meeting.
- Decisions are things the group explicitly agreed on or resolved. Action items are concrete next steps someone needs to do. Key points are notable discussion points that aren't decisions or action items.
- If a category has nothing in it, return an empty array for it rather than making something up.

OUTPUT FORMAT: Respond with ONLY a valid JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "summary": "string",
  "decisions": ["string", ...],
  "action_items": [{"task": "string", "owner": "string", "deadline": "string"}, ...],
  "key_points": ["string", ...]
}`;

document.getElementById('form-meeting').addEventListener('submit', async (e) => {
  e.preventDefault();
  const outputEl = document.getElementById('output-meeting');
  const data = new FormData(e.target);
  const title = data.get('title').trim();
  const notes = data.get('notes').trim();

  const userPrompt = `Meeting title: ${title || '(not given)'}
Raw notes:
"""
${notes}
"""`;

  setLoading(outputEl);
  try {
    const raw = await callModel(MEETING_SYSTEM_PROMPT, userPrompt);
    const json = extractJSON(raw);
    if (!json || !json.summary) throw new Error('The model returned a response Inkwell could not parse. Try again.');
    renderMeeting(outputEl, json);
  } catch (err) {
    setError(outputEl, err.message);
  }
});

function renderMeeting(outputEl, { summary, decisions, action_items, key_points }) {
  const list = (arr, empty) => arr && arr.length
    ? `<ul>${arr.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
    : `<p class="output-empty" style="padding:0;">${empty}</p>`;

  const actionsList = action_items && action_items.length
    ? `<ul>${action_items.map(a => `<li><strong>${escapeHtml(a.task)}</strong> — ${escapeHtml(a.owner)} · ${escapeHtml(a.deadline)}</li>`).join('')}</ul>`
    : `<p class="output-empty" style="padding:0;">No action items identified.</p>`;

  outputEl.innerHTML = `
    <div class="output-result">
      <h3>Summary</h3>
      <p>${escapeHtml(summary)}</p>
      <h3>Decisions</h3>
      ${list(decisions, 'No firm decisions identified.')}
      <h3>Action items</h3>
      ${actionsList}
      <h3>Other key points</h3>
      ${list(key_points, 'Nothing further noted.')}
      <div class="result-actions">
        <button data-action="copy">Copy summary</button>
      </div>
      <div class="output-disclaimer">${DISCLAIMER}</div>
    </div>`;

  outputEl.querySelector('[data-action="copy"]').addEventListener('click', (e) => {
    const plain = [
      `Summary: ${summary}`,
      `\nDecisions:\n${(decisions || []).map(d => '- ' + d).join('\n') || 'None'}`,
      `\nAction items:\n${(action_items || []).map(a => `- ${a.task} (${a.owner}, ${a.deadline})`).join('\n') || 'None'}`,
      `\nOther key points:\n${(key_points || []).map(k => '- ' + k).join('\n') || 'None'}`
    ].join('\n');
    copyText(plain, e.target);
  });
}

/* =========================================================
   TOOL 3 — AI Task Planner / Scheduler
========================================================= */
const PLANNER_SYSTEM_PROMPT = `You are a pragmatic productivity coach embedded in a tool called Inkwell.

TASK: Take a raw list of tasks and turn it into a prioritized, realistic plan.

RULES:
- Prioritize using urgency (deadlines mentioned) and importance (impact implied by the task), not just the order given.
- Respect the stated hours available — do not overload the plan. If tasks clearly exceed the available time, say so in "notes" and move the lowest-priority items to a "Later" block rather than silently dropping them.
- Give each task a priority of "High", "Medium", or "Low".
- Give a one-sentence "reasoning" for each task's placement — be concrete (e.g. "due today" or "blocks other work"), not generic.
- Group tasks into ordered blocks that make sense for the requested planning span (e.g. "Morning" / "Afternoon" for a single day, or day names for a week).
- Never invent a deadline that wasn't stated.

OUTPUT FORMAT: Respond with ONLY a valid JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "plan": [{"block": "string", "task": "string", "priority": "High|Medium|Low", "reasoning": "string"}, ...],
  "notes": "string — any scheduling risk or overload warning, or empty string if none"
}`;

document.getElementById('form-planner').addEventListener('submit', async (e) => {
  e.preventDefault();
  const outputEl = document.getElementById('output-planner');
  const data = new FormData(e.target);
  const tasks = data.get('tasks').trim();
  const hours = data.get('hours');
  const span = data.get('span');

  const userPrompt = `Tasks (one per line, may include deadlines):
"""
${tasks}
"""
Hours available: ${hours}
Planning span: ${span === 'week' ? 'the upcoming week' : 'today'}`;

  setLoading(outputEl);
  try {
    const raw = await callModel(PLANNER_SYSTEM_PROMPT, userPrompt);
    const json = extractJSON(raw);
    if (!json || !json.plan) throw new Error('The model returned a response Inkwell could not parse. Try again.');
    renderPlanner(outputEl, json);
  } catch (err) {
    setError(outputEl, err.message);
  }
});

function renderPlanner(outputEl, { plan, notes }) {
  const blocks = {};
  (plan || []).forEach(item => {
    blocks[item.block] = blocks[item.block] || [];
    blocks[item.block].push(item);
  });

  const blocksHtml = Object.entries(blocks).map(([block, items]) => `
    <h3>${escapeHtml(block)}</h3>
    <ul>
      ${items.map(i => `<li><strong>[${escapeHtml(i.priority)}]</strong> ${escapeHtml(i.task)} — <span style="color:var(--ink-faint)">${escapeHtml(i.reasoning)}</span></li>`).join('')}
    </ul>`).join('');

  outputEl.innerHTML = `
    <div class="output-result">
      ${blocksHtml || '<p class="output-empty" style="padding:0;">No tasks could be scheduled.</p>'}
      ${notes ? `<h3>Notes</h3><p>${escapeHtml(notes)}</p>` : ''}
      <div class="result-actions">
        <button data-action="copy">Copy plan</button>
      </div>
      <div class="output-disclaimer">${DISCLAIMER}</div>
    </div>`;

  outputEl.querySelector('[data-action="copy"]').addEventListener('click', (e) => {
    const plain = Object.entries(blocks).map(([block, items]) =>
      `${block}:\n` + items.map(i => `- [${i.priority}] ${i.task} — ${i.reasoning}`).join('\n')
    ).join('\n\n') + (notes ? `\n\nNotes: ${notes}` : '');
    copyText(plain, e.target);
  });
}

/* ---------- Boot ---------- */
refreshConnectionStatus();
