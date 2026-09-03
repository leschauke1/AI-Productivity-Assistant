# Inkwell — AI-Powered Workplace Productivity Assistant

**Live site:** [ai-poweredassistant.netlify.app](https://ai-poweredassistant.netlify.app/)
**Repository:** [github.com/leschauke1/AI-Productivity-Assistant](https://github.com/leschauke1/AI-Productivity-Assistant.git)

A static website with three AI-powered tools: an email generator, a meeting notes summarizer, and a task planner. No build step, no backend — it's plain HTML/CSS/JS, so it deploys anywhere that hosts static files.

## Deploy to Netlify (drag-and-drop, ~1 minute)

This project is already deployed at [ai-poweredassistant.netlify.app](https://ai-poweredassistant.netlify.app/). To redeploy your own copy, or push an update:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole `inkwell` folder onto the page
3. Netlify gives you a live URL immediately — done

*(Alternative: connect this folder as a GitHub repo to Netlify for auto-deploys on every push. Build command: none. Publish directory: `/`.)*

## Using the site

1. Open [ai-poweredassistant.netlify.app](https://ai-poweredassistant.netlify.app/) and click **Settings** (top right)
2. Choose a provider — **OpenAI** or **Google Gemini**
3. Paste your own API key:
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
4. Confirm or edit the model name (defaults to a small, cheap model for each provider)
5. Click **Save** — the key is stored only in your browser's local storage
6. Use any of the three tools from the left rail

## Important: this is a client-side demo, not production architecture

The API key is entered by each visitor and calls are made **directly from their browser** to OpenAI/Gemini. That's fine for a personal tool, a portfolio piece, or a course demo where you control who uses it — but it is **not safe for a public product**, because:
- Anyone who opens the browser dev tools can read the key out of local storage
- There's no rate limiting, so a malicious visitor could rack up charges on your key if you ever hardcoded one

If you outgrow the demo, the fix is a **Netlify serverless function** that holds the API key server-side and the frontend calls that function instead of the AI provider directly. The current code is already structured so only `callModel()` in `app.js` would need to change — swap the two `fetch()` calls for a single call to `/.netlify/functions/generate`.

## Files

```
inkwell/
├── index.html    — page structure, all three tool forms
├── styles.css    — visual design (ledger/workbench theme)
├── app.js        — tab routing, settings, AI calls, prompt templates
└── README.md     — this file
```

## Responsible AI notes

- Every generated result carries a visible disclaimer to review before acting on it
- Prompts explicitly instruct the model not to invent names, dates, or figures that weren't in the user's input
- Meeting summarizer marks missing owners/deadlines as "Unassigned" / "Not specified" rather than guessing
- Task planner surfaces overload risk in a "Notes" field instead of silently dropping tasks
- No user input, notes, or API key is sent to any server other than the AI provider chosen in Settings
