# Code-to-Diagram Guide

Use when given source code and asked to generate a Mermaid diagram from it.

---

## Reading Strategy

Before generating, identify from the code:

1. **What type of diagram fits?**
   - Classes / interfaces → `classDiagram`
   - Function call chain / async flow → `sequenceDiagram`
   - State machine / enum + transitions → `stateDiagram-v2`
   - Config / startup / data pipeline → `flowchart LR`

2. **What is the grain?**
   - Architecture overview (services/modules) → coarse nodes, no field detail
   - Implementation detail (methods/calls) → fine nodes, show params

3. **What to omit?**
   - Getters/setters, boilerplate, imports
   - Internal helpers not relevant to the diagram's purpose

---

## Pattern: TypeScript / JavaScript

### Class → classDiagram

Given:
```ts
interface IGameEntity {
  id: string
  update(dt: number): void
}

abstract class Unit implements IGameEntity {
  id: string
  protected hp: number
  protected maxHp: number
  abstract attack(target: Unit): void
  update(dt: number): void { ... }
}

class Horse extends Unit {
  atk: number
  attack(target: Unit): void { ... }
}
```

Produces:
```
classDiagram
    %% ─── Game Entity Hierarchy ─────────────────────────────────

    class IGameEntity {
        <<interface>>
        +String id
        +update(dt) void
    }

    class Unit {
        <<abstract>>
        +String   id
        #int      hp
        #int      maxHp
        +update(dt) void
        +attack(target)* void
    }

    class Horse {
        <<entity>>
        +int  atk
        +attack(target) void
    }

    IGameEntity <|.. Unit  : implements
    Unit        <|-- Horse : extends

    classDef iface  fill:#0d2b44,stroke:#90caf9,stroke-width:2px,color:#e8f4fd
    classDef abstract fill:#e65100,stroke:#ffcc80,stroke-width:2px,color:#fff
    classDef entity fill:#1e3a5f,stroke:#4a90d9,stroke-width:2px,color:#fff

    class IGameEntity:::iface
    class Unit:::abstract
    class Horse:::entity
```

---

### Async function chain → sequenceDiagram

Given:
```ts
async function placeOrder(dto: OrderDTO) {
  const user  = await userRepo.findById(dto.userId)
  const order = Order.create(dto)
  await orderRepo.save(order)
  await eventBus.publish(new OrderPlaced(order))
  return order
}
```

Produces:
```
sequenceDiagram
    %% ─── placeOrder Flow ───────────────────────────────────────
    autonumber

    participant SVC as OrderService
    participant UR  as UserRepo
    participant OR  as OrderRepo
    participant EB  as EventBus

    SVC ->>+ UR:  findById(userId)
    UR  -->>- SVC: user

    Note right of SVC: Order.create(dto) — local

    SVC ->>+ OR:  save(order)
    OR  -->>- SVC: void

    SVC -)   EB:  publish(OrderPlaced) — async
```

---

### State enum + transitions → stateDiagram-v2

Given:
```ts
enum OrderStatus { PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED }

function transition(current: OrderStatus, event: string): OrderStatus {
  switch (current) {
    case PENDING:   return event === 'pay'     ? CONFIRMED  : CANCELLED
    case CONFIRMED: return event === 'dispatch'? SHIPPED    : CONFIRMED
    case SHIPPED:   return event === 'deliver' ? DELIVERED  : SHIPPED
    default:        return current
  }
}
```

Produces:
```
stateDiagram-v2
    %% ─── OrderStatus State Machine ────────────────────────────
    [*]       --> PENDING    : created

    PENDING   --> CONFIRMED  : pay
    PENDING   --> CANCELLED  : timeout / cancel

    CONFIRMED --> SHIPPED    : dispatch
    SHIPPED   --> DELIVERED  : deliver

    DELIVERED --> [*]
    CANCELLED --> [*]
```

---

## Pattern: Game Logic (frontend-game)

### Game loop / update cycle → flowchart

Given:
```ts
class GameLoop {
  update(dt: number) {
    this.input.process()
    this.physics.step(dt)
    this.entities.forEach(e => e.update(dt))
    this.combatSystem.resolve()
    this.renderer.draw()
  }
}
```

Produces:
```
%%{init: { ... }}%%
flowchart TD
    %% ─── Game Loop — Update Cycle ─────────────────────────────
    TICK(["`⏱ tick(dt)`"])
    INPUT["`🎮 Input.process()<br>read player actions`"]
    PHYS["`⚙️ Physics.step(dt)<br>move, collide`"]
    ENT["`🔄 Entity.update(dt)<br>forEach entity`"]
    COMBAT["`⚔️ CombatSystem.resolve()<br>apply damage, effects`"]
    RENDER["`🖼 Renderer.draw()<br>flush to canvas`"]
    NEXT(["`⏭ next tick`"])

    TICK --> INPUT --> PHYS --> ENT --> COMBAT --> RENDER --> NEXT

    style TICK   fill:#1565c0,stroke:#90caf9,stroke-width:2px,color:#fff
    style COMBAT fill:#4a148c,stroke:#ce93d8,stroke-width:2px,color:#fff
    style NEXT   fill:#2e7d32,stroke:#a5d6a7,stroke-width:2px,color:#fff
```

### Component/system architecture → flowchart LR

Given a file structure:
```
src/
  systems/CombatSystem.ts   — uses AttackResolver, DamageCalculator
  systems/ComboSystem.ts    — uses ElementQueue, ComboDetector
  entities/Horse.ts         — has Stats, Equipment
```

Produces:
```
%%{init: { ... }}%%
flowchart LR
    %% ─── System Architecture ────────────────────────────────────

    subgraph SYSTEMS ["⚙️ Systems"]
        CS[["`⚔️ CombatSystem`"]]
        COS[["`🌀 ComboSystem`"]]
    end

    subgraph UTIL ["🔧 Utilities"]
        AR["`AttackResolver`"]
        DC["`DamageCalculator`"]
        EQ["`ElementQueue`"]
        CD["`ComboDetector`"]
    end

    subgraph ENTITIES ["🎮 Entities"]
        H["`🐴 Horse`"]
        ST["`Stats`"]
        EQ2["`Equipment`"]
    end

    CS  --> AR & DC
    COS --> EQ & CD
    H   --> ST & EQ2
    CS  ..> H
    COS ..> CS
```

---

## Rules for Code-to-Diagram

1. **Ask intent first** — "architecture overview" vs "implementation detail" produce very different diagrams
2. **Omit noise** — skip getters, setters, constructors unless they contain logic
3. **Abstract generics** — `Repository<T>` → `Repository~T~` in classDiagram
4. **One diagram per concern** — don't mix class hierarchy + sequence in one diagram
5. **Always apply theme + highlights** — code-generated diagrams still need `%%{init}` and `style` blocks
6. **Add `%% ─── TITLE` comment** with the source file/class name for traceability
