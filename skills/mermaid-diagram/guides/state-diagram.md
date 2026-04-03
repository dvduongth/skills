# State Diagram Guide

Use for: status machines, lifecycle flows, order states, game character states, UI screen flows, protocol states.

---

## Basic Syntax

```
stateDiagram-v2
    [*] --> StateName          entry point (initial)
    StateName --> [*]          exit point (terminal / final)

    StateA --> StateB : event / trigger
    StateA --> StateB : event [guard condition]
    StateA --> StateB : event / action
```

**Combined format:** `trigger [guard] / action`
```
    Idle --> Running : start [fuel > 0] / engine.on()
```

---

## Notes

```
    note right of StateName
        Multi-line note.<br>Use <br> for line breaks.
    end note

    note left of StateName : Single line note
```

---

## Composite States (nested)

```
stateDiagram-v2
    state "Order Processing" as Processing {
        [*]         --> Validating
        Validating  --> Charging  : valid
        Validating  --> [*]       : invalid
        Charging    --> Fulfilling: charged
        Fulfilling  --> [*]       : fulfilled
    }

    [*]         --> Processing
    Processing  --> Completed : done
    Processing  --> Failed    : error
    Completed   --> [*]
    Failed      --> [*]
```

---

## Concurrent States (fork/join)

```
stateDiagram-v2
    [*] --> Active

    state Active {
        [*] --> HealthRegen
        [*] --> ManaRegen

        state HealthRegen {
            [*]        --> Recovering
            Recovering --> Full : hp == maxHp
            Full       --> [*]
        }

        state ManaRegen {
            [*]        --> Regenerating
            Regenerating --> Full : mp == maxMp
            Full         --> [*]
        }
    }

    Active --> Dead : hp == 0
```

---

## Choice / Fork / Join

```
stateDiagram-v2
    state paymentChoice <<choice>>

    Checkout --> paymentChoice : pay
    paymentChoice --> CardFlow   : card
    paymentChoice --> WalletFlow : wallet
    paymentChoice --> BankFlow   : bank

    state fork_state <<fork>>
    state join_state <<join>>

    Processing --> fork_state
    fork_state --> NotifyEmail
    fork_state --> NotifySMS
    NotifyEmail --> join_state
    NotifySMS   --> join_state
    join_state  --> Done
```

---

## Full Template

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#1e3a5f', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#0d2137', 'lineColor': '#4a90d9', 'background': '#0a1f33', 'nodeBorder': '#4a90d9', 'fontFamily': 'Segoe UI, Arial, sans-serif', 'fontSize': '14px' } }}%%
stateDiagram-v2
    %% ─── [Entity] State Machine ────────────────────────────────
    %% States: list all valid states and their meaning

    [*]         --> Pending    : created

    Pending     --> Confirmed  : payment ok
    Pending     --> Cancelled  : timeout / user cancel

    Confirmed   --> Shipped    : warehouse dispatch
    Confirmed   --> Cancelled  : merchant cancel

    Shipped     --> Delivered  : courier confirms
    Shipped     --> Returned   : customer rejects

    Delivered   --> [*]
    Cancelled   --> [*]
    Returned    --> [*]

    note right of Confirmed
        SLA: must ship<br>within 24 hours
    end note

    note right of Shipped
        Tracking ID assigned<br>on dispatch
    end note
```

---

## Patterns

### Game Character States

```
stateDiagram-v2
    %% ─── Character State Machine ───────────────────────────────

    [*]     --> Idle

    Idle    --> Walking   : move input
    Idle    --> Attacking : attack input
    Idle    --> Dead      : hp == 0

    Walking --> Idle      : no input
    Walking --> Running   : sprint held
    Walking --> Dead      : hp == 0

    Running --> Walking   : sprint released
    Running --> Dead      : hp == 0

    Attacking --> Idle    : animation done
    Attacking --> Dead    : hp == 0

    Dead    --> [*]

    note right of Attacking
        Combo window: 300ms<br>after first hit
    end note
```

### UI Screen Flow

```
stateDiagram-v2
    %% ─── App Screen States ─────────────────────────────────────

    [*]       --> Splash

    Splash    --> Login    : not authenticated
    Splash    --> Home     : token valid

    Login     --> Home     : login success
    Login     --> Register : tap register

    Register  --> Login    : registered

    Home      --> Detail   : tap item
    Home      --> Settings : tap settings
    Detail    --> Home     : back
    Settings  --> Home     : back

    Home      --> [*]      : logout
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing `[*]` as entry | Every state diagram needs `[*] --> InitialState` |
| Missing terminal `State --> [*]` | All final states must transition to `[*]` |
| Transition label missing | Always label: `A --> B : event` |
| `\n` in note | Use `<br>` inside `note` blocks |
| Too many states in one diagram | Split: happy path + error path as separate diagrams |
| Deep nesting (3+ levels) | Max 2 levels of nested composite states |
