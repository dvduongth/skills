# Sequence Diagram Guide

Use for: API flows, service interactions, request/response chains, auth flows, message passing, time-ordered events.

---

## Participant Types

```
participant A as Alias     — rectangle box (default)
actor       U as User      — stick figure icon
```

Declare all participants at the top in the order they should appear left-to-right.

---

## Arrow / Message Types

```
A  ->>  B: message          solid arrow, no wait (async)
A  ->>+ B: message          solid arrow + activate B (sync call)
B -->>- A: response         dashed arrow + deactivate B (return)
A  -x   B: message          solid arrow, X head (failure/abort)
A  -)   B: message          open arrow (fire-and-forget)
A  -->> B: message          dashed, no activate (internal note)
```

**Pattern for sync call/return:**
```
Caller ->>+ Callee: call()
Callee -->>- Caller: result
```

---

## Control Structures

```
loop Every 30s
    A ->> B: heartbeat
end

alt success path
    B -->> A: 200 OK
else error path
    B -->> A: 500 Error
end

opt optional step
    A ->> C: notify (only if subscribed)
end

par parallel actions
    A ->> B: action1
and
    A ->> C: action2
end

critical atomic section
    A ->> DB: BEGIN TRANSACTION
    A ->> DB: UPDATE ...
    A ->> DB: COMMIT
option rollback
    A ->> DB: ROLLBACK
end

break on fatal error
    A ->> B: request
    B -->> A: 503 abort
end
```

---

## Notes & Annotations

```
Note right of A: Single participant note
Note over A,B: Spans multiple participants.<br>Use <br> for multi-line.
Note left of B: Left-side note
```

---

## Autonumber

```
sequenceDiagram
    autonumber
    A ->> B: step 1
    B -->> A: step 2
```

Adds step numbers automatically — useful for API docs.

---

## Full Template

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#1e3a5f', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#0d2137', 'lineColor': '#4a90d9', 'background': '#0a1f33', 'nodeBorder': '#4a90d9', 'edgeLabelBackground': '#0d2b44', 'fontFamily': 'Segoe UI, Arial, sans-serif', 'fontSize': '14px', 'actorBkg': '#1e3a5f', 'actorBorder': '#4a90d9', 'actorTextColor': '#ffffff', 'activationBorderColor': '#4a90d9', 'activationBkgColor': '#2e5f8a', 'noteBkgColor': '#0d2b44', 'noteTextColor': '#e8f4fd', 'noteBorderColor': '#4a90d9' } }}%%
sequenceDiagram
    %% ─── [Flow Title] ──────────────────────────────────────────
    %% Purpose: what interaction this diagram shows

    autonumber

    actor      U  as 👤 User
    participant FE as Frontend
    participant BE as Backend
    participant DB as 🗄 Database

    %% ─── HAPPY PATH ────────────────────────────────────────────
    U  ->>+ FE: action(input)
    FE ->>+ BE: POST /api/endpoint

    BE ->>+ DB: SELECT ...
    DB -->>- BE: rows

    BE -->>- FE: 200 { data }
    FE -->>- U:  render result

    %% ─── ERROR PATH ────────────────────────────────────────────
    alt validation error
        BE -->> FE: 400 { error }
        FE -->> U:  show error message
    end

    Note over BE,DB: Passwords hashed<br>with bcrypt (cost=12)
```

---

## Patterns

### Auth / Token Flow

```
    U  ->>+ FE: login(email, pwd)
    FE ->>+ BE: POST /auth/login
    BE ->>+ DB: SELECT user WHERE email=?
    DB -->>- BE: user row
    Note right of BE: Compare pwd with<br>bcrypt.compare()
    BE -->>- FE: 200 { jwt }
    FE -->>- U:  store token, redirect
```

### Async / Queue

```
    FE ->>  BE:  POST /jobs          (enqueue, no wait)
    BE -)   Q:   job.publish(payload)
    Note over Q: async processing
    Q  ->>+ Worker: consume job
    Worker ->>  DB: INSERT result
    Worker -->>-Q:  ack
```

### Webhook Callback

```
    FE ->>+ BE: POST /payment/init
    BE ->>+ PSP: charge(amount)
    PSP -->>- BE: 202 pending
    BE -->>- FE: { status: pending }

    Note over PSP,BE: Later, async...
    PSP ->>  BE: POST /webhook { paid }
    BE  ->>  DB: UPDATE order SET paid=true
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing `activate`/`deactivate` on sync calls | Use `->>+` / `-->>-` pair |
| `\n` in Note text | Use `<br>` |
| Participant order wrong | Declare in left-to-right order at top |
| Too many participants (>6) | Split into sub-diagrams per flow |
| Long message labels | Keep ≤ 5 words; details go in Note |
| No `alt`/`opt` for error paths | Always show at least the error branch |
