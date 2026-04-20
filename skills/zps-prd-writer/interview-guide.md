# Extended Interview Guide — Deep-Dive Questions by Product Type

> Read this file after classifying the product type in Phase 2 of SKILL.md to get deeper probing for complex products. Organized by product archetype — pick the relevant section and mix questions into your rounds.

---

## General Probing Techniques

When the user gives a vague answer, use these follow-ups. **Always use the `AskUserQuestion` tool** when probing with concrete options — this renders as an interactive selector in the terminal, making it easy for the user to pick.

| User says | You probe with (via `AskUserQuestion`) |
|-----------|---------------|
| "It should be fast" | Options: "< 1 giây", "1-3 giây", "3-5 giây", "Không quan trọng lắm" |
| "A few users" | Options: "1-5 người", "5-20 người", "20-100 người", "100+ người" |
| "Standard security" | Options: "Chỉ cần đăng nhập", "Phân quyền theo role", "Shared password", "Không cần auth" |
| "Something like [product X]" | Free-form question: "What specifically about [X] do you want? Let's list the 3 features that matter most." |
| "I don't know" | Propose a sensible default via `AskUserQuestion` with 2-3 options including your recommendation |
| "Whatever you think is best" | Use `AskUserQuestion` with your recommendation marked "(Recommended)" as the first option |
| "All of the above" / "Tất cả" | Use `AskUserQuestion`: "Nếu chỉ chọn 1 ưu tiên cao nhất?" with the options they previously selected |
| Selects every option | Use `AskUserQuestion`: "Nếu chỉ có 1 tuần, bạn làm cái nào trước?" with the options listed |

---

## Product Type: Data/Analytics Tool

Extra questions to weave into your rounds:

### Data-specific
- What file formats does the data come in? (CSV, Excel, JSON, Parquet, DB export)
- How large are typical files? (rows × columns, MB)
- How often does the data update? (daily dump, real-time stream, manual upload)
- Is the data clean or does it need preprocessing? (nulls, encoding issues, mixed types)
- Any date/time columns? What timezone? What format?
- Do different datasets need to be joined/merged? On what key?

### Analysis-specific
- What kind of questions do users ask about the data? (Give me 3 examples)
- Do they need statistical analysis? (correlation, regression, anomaly detection)
- Do they need visualizations? What chart types? (bar, line, pie, scatter, heatmap)
- Do they compare data across dimensions? (time periods, markets, segments)
- Do they need to export results? In what format? To whom?

### AI/LLM-specific (if applicable)
- Which LLM provider? (OpenAI, Anthropic, Google, self-hosted, multi-model)
- Who controls the prompts? (hardcoded, user-editable, template library)
- How should the tool handle LLM errors or hallucinations?
- Is there domain knowledge the LLM needs? How is it provided? (RAG, system prompt, fine-tuning)
- What's the acceptable cost per query/session?
- Does the LLM need to access/query the actual data, or just receive summaries?

---

## Product Type: CRUD / Management Tool

### Entity-specific
- What are the main "things" in the system? (users, projects, orders, tickets)
- How do they relate to each other? (one-to-many, many-to-many)
- What's the lifecycle of each entity? (draft → active → archived → deleted)
- Who can create, edit, delete each entity?
- Do you need audit trails? (who changed what, when)

### Workflow-specific
- Are there approval workflows? (submit → review → approve)
- Are there status transitions with rules? (can't close until all subtasks done)
- Are there notifications/alerts? (email, in-app, Slack, Telegram)
- Any recurring/scheduled tasks?

---

## Product Type: Automation / Agent Tool

### Trigger-specific
- What triggers the automation? (schedule, event, user action, webhook)
- How often does it run? What's the expected execution time?
- What happens when it fails? Retry? Alert? Rollback?

### Agent-specific
- What tools/APIs does the agent need access to?
- What are the boundaries? What should it NEVER do autonomously?
- Does it need human approval at any step?
- How does the user monitor what the agent is doing?
- What's the maximum cost per execution?

---

## Product Type: API / Backend Service

### Endpoint-specific
- Who are the API consumers? (frontend, mobile app, third-party, other services)
- REST or GraphQL? Any preference?
- What authentication? (API key, OAuth, JWT, none)
- Rate limiting needed? What thresholds?
- Versioning strategy? (URL path, header)

### Data-specific
- What's the expected data volume? (requests/day, DB size)
- Any data retention policies? (delete after X days)
- Caching needs? (Redis, CDN, in-memory)
- Background job processing? (queues, workers)

---

## Product Type: AI-Powered Application

### Model Integration
- Single model or multi-model? Reasoning for choice?
- Streaming responses or batch?
- Context window management strategy? (summarize, truncate, RAG)
- Tool use / function calling needed? What functions?
- Structured output needed? (JSON mode, schema validation)

### Cost & Quality
- Cost sensitivity? (optimize for cost vs quality)
- Acceptable latency for AI responses? (real-time < 3s? batch is OK?)
- How to handle model downtime? (fallback model, graceful degradation, queue)
- Quality evaluation? (user feedback, automated checks, human review)

### Safety & Privacy
- Does user data get sent to external LLM providers?
- PII handling? (mask before sending, anonymize, on-premise only)
- Content moderation needed? (filter harmful outputs)
- Audit logging for AI interactions?

---

## Product Type: Mobile Application

### Platform-specific
- iOS only, Android only, or cross-platform?
- If cross-platform: React Native, Flutter, or other framework preference?
- Minimum OS version to support? (affects available APIs)
- Does the app need to work offline? What features work without network?
- Push notifications needed? What events trigger them?

### Mobile UX
- Portrait only, landscape only, or both orientations?
- Any gesture-based interactions? (swipe, pinch, long-press)
- Camera, GPS, microphone, or other hardware access needed?
- Does it need to integrate with device features? (contacts, calendar, health data, biometrics)
- App size constraints? (important for markets with limited bandwidth)

### Distribution
- App Store / Google Play, or enterprise distribution (MDM)?
- In-app purchases or subscriptions?
- Analytics/crash reporting preference? (Firebase, Sentry, etc.)

---

## Product Type: CLI Tool

### Command Design
- What's the primary command? (`tool-name <action> <args>` or `tool-name --flag`?)
- Interactive prompts or purely non-interactive (for scripting/CI)?
- Does it need a config file? Where? (`.toolrc`, `tool.config.json`, etc.)
- What's the expected input? (stdin, files, arguments, flags)
- What's the expected output? (stdout, files, exit codes)

### Environment
- Target OS? (macOS, Linux, Windows, all three)
- Package manager distribution? (npm, brew, apt, binary releases)
- Does it need to persist state between runs? (local DB, cache, config)
- Does it call external APIs or services?
- Should it support piping? (`cat file | tool-name | other-tool`)

### Developer Experience
- Verbose/debug mode needed?
- Color output or plain text (for CI compatibility)?
- Auto-update mechanism?
- Shell completions? (bash, zsh, fish)

---

## Product Type: Browser Extension

### Extension Basics
- Chrome only, Firefox only, or multi-browser? (Safari, Edge)
- Manifest V3 (required for Chrome) — any V2 dependencies to migrate?
- What pages/domains does it activate on? (all sites, specific domains, user-configured)
- Does it need a popup UI, sidebar panel, options page, or all three?

### Permissions & Data
- What browser APIs needed? (tabs, storage, activeTab, scripting, cookies, webRequest)
- Does it modify page content? (content scripts — what elements, what changes)
- Does it need a backend/server? Or purely client-side?
- Data storage: local only (chrome.storage) or synced across devices?
- Privacy: does it read/transmit page content or user data?

### Distribution
- Chrome Web Store / Firefox Add-ons, or self-hosted?
- Free or paid? Freemium model?
- Update frequency expectations?

---

## UX & Design Preferences

Ask these when the product has a user-facing interface (web, mobile, desktop):

### Visual Design
- Any existing brand guidelines or design system to follow? (colors, fonts, logo)
- Design style preference? (minimal/clean, corporate/professional, playful/colorful, dashboard-heavy)
- Dark mode, light mode, or both? Which is default?
- Any reference products whose look & feel you admire? ("I want it to look like [X]")

### Layout & Navigation
- Sidebar navigation, top navbar, or bottom tabs (mobile)?
- Single-page app feel or traditional page navigation?
- How many primary screens/views are there?
- Any specific responsive breakpoints? (mobile-first? desktop-first?)

### Interaction Patterns
- Real-time updates needed? (WebSocket, SSE, polling)
- Drag-and-drop interactions?
- Keyboard shortcuts for power users?
- Loading states preference? (skeleton, spinner, progress bar)
- Toast notifications, modal dialogs, or inline alerts for feedback?

### Accessibility
- WCAG compliance level required? (A, AA, AAA)
- Screen reader support needed?
- Specific accessibility requirements? (color contrast, font size, keyboard navigation)

---

## Closing Questions (Use at End of Any Interview)

These catch what the structured rounds might miss:

1. "Is there anything about how you work today that we haven't discussed but should be captured?"
2. "If you could only have ONE feature working perfectly on day 1, which would it be?"
3. "What's the worst outcome if this tool is built wrong? What would break?"
4. "Who else should I have talked to? Is there another stakeholder's perspective we're missing?"
5. "Is there an existing tool or product that's closest to what you want? What would you change about it?"

---

## Anti-Patterns to Avoid During Interview

| Anti-pattern | Why it's bad | What to do instead |
|-------------|-------------|-------------------|
| Asking multiple questions at once | Overwhelms user, gets shallow answers | **Strictly ONE question per message, no exceptions** |
| Accepting "yes/no" for complex topics | Misses nuance and edge cases | Follow up: "Can you walk me through an example?" |
| Assuming technical knowledge | Confuses non-technical users | Gauge skill level early (during Problem & Context), adapt language |
| Skipping "out of scope" | Dev agent builds unwanted features | Always explicitly ask what NOT to build |
| Not summarizing between rounds | User loses track, contradictions slip through | Summarize after each topic, get confirmation |
| Inventing requirements the user didn't mention | PRD includes phantom features | Mark inferences clearly: "I'm assuming X — correct?" |
| Over-interviewing simple products | User gets impatient, diminishing returns | A simple tool needs 5-10 minutes, not 30 |
