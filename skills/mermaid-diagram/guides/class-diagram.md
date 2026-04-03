# Class Diagram Guide

Use for: domain models, UML class diagrams, object relationships, interface contracts, service architecture.

---

## Class Definition

```
classDiagram
    class ClassName {
        <<stereotype>>
        +Type  publicField
        -Type  privateField
        #Type  protectedField
        ~Type  packageField
        +method(param) ReturnType
        -privateMethod() void
        $staticField : Type
        $staticMethod() ReturnType
    }
```

**Stereotypes (inside `<<...>>`):**

| Stereotype | Meaning |
|------------|---------|
| `<<interface>>` | Java/TS interface |
| `<<abstract>>` | Abstract class |
| `<<enum>>` | Enumeration |
| `<<service>>` | Service layer |
| `<<repository>>` | Data access layer |
| `<<aggregate>>` | DDD aggregate root |
| `<<entity>>` | DDD entity |
| `<<value object>>` | DDD value object |
| `<<event>>` | Domain event |

---

## Relationships

```
ClassA --|> ClassB          inheritance (A extends B)
ClassA ..|> InterfaceB      realization (A implements B)
ClassA --> ClassB           association (A uses B)
ClassA ..> ClassB           dependency (A depends on B, weaker)
ClassA --* ClassB           composition (B owned by A, lifecycle bound)
ClassA --o ClassB           aggregation (B referenced by A, independent)

%% With multiplicity:
ClassA "1"  --> "0..*" ClassB : label
ClassA "1"  *-- "1..*" ClassB : contains
ClassA "0..*" o-- "1"  ClassB : belongs to
```

**Multiplicity values:** `1`, `0..1`, `1..*`, `0..*`, `*`, `N`

---

## Styling Classes

```
    %% ─── STYLES ────────────────────────────────────────────────
    style ClassName fill:#1e3a5f,stroke:#4a90d9,color:#fff
    style Interface fill:#0d2b44,stroke:#90caf9,color:#e8f4fd

    %% Or use classDef for groups:
    classDef entity    fill:#1e3a5f,stroke:#4a90d9,color:#fff
    classDef interface fill:#0d2b44,stroke:#90caf9,color:#e8f4fd
    classDef service   fill:#4a148c,stroke:#ce93d8,color:#fff
    classDef abstract  fill:#e65100,stroke:#ffcc80,color:#fff

    class Order:::entity
    class IRepository:::interface
    class OrderService:::service
```

**Rule:** Every `classDef` and `style` MUST include `color:` property.

---

## Full Template

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#1e3a5f', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#0d2137', 'lineColor': '#4a90d9', 'background': '#0a1f33', 'nodeBorder': '#4a90d9', 'clusterBkg': '#0d2b44', 'fontFamily': 'Segoe UI, Arial, sans-serif', 'fontSize': '14px' } }}%%
classDiagram
    %% ─── [Domain Model Title] ──────────────────────────────────
    %% Purpose: describe what domain/bounded context this shows

    %% ─── INTERFACES ─────────────────────────────────────────────
    class IRepository~T~ {
        <<interface>>
        +findById(id) T
        +save(entity) void
        +delete(id) void
    }

    %% ─── ENTITIES ───────────────────────────────────────────────
    class Order {
        <<aggregate>>
        +String   id
        +Date     createdAt
        +Status   status
        +place()  void
        +cancel() void
        +total()  float
    }

    class OrderItem {
        <<entity>>
        +String  productId
        +int     quantity
        +float   unitPrice
        +subtotal() float
    }

    class Customer {
        <<entity>>
        +String  id
        +String  email
        +String  name
        +place(Order) void
    }

    %% ─── ENUMS ──────────────────────────────────────────────────
    class Status {
        <<enum>>
        PENDING
        CONFIRMED
        SHIPPED
        DELIVERED
        CANCELLED
    }

    %% ─── RELATIONSHIPS ──────────────────────────────────────────
    IRepository~Order~ <|.. OrderRepository : implements

    Order       "1"   *-- "1..*" OrderItem : contains
    Order       "1"   --> "1"    Status    : has
    Customer    "1"   --> "0..*" Order     : places

    %% ─── STYLES ────────────────────────────────────────────────
    classDef entity    fill:#1e3a5f,stroke:#4a90d9,stroke-width:2px,color:#fff
    classDef iface     fill:#0d2b44,stroke:#90caf9,stroke-width:2px,color:#e8f4fd
    classDef enum      fill:#2e7d32,stroke:#a5d6a7,stroke-width:2px,color:#fff
    classDef repo      fill:#4a148c,stroke:#ce93d8,stroke-width:2px,color:#fff

    class Order:::entity
    class OrderItem:::entity
    class Customer:::entity
    class Status:::enum
    class IRepository:::iface
    class OrderRepository:::repo
```

---

## Patterns

### Service Layer

```
    class OrderService {
        <<service>>
        -OrderRepository repo
        -EventBus        events
        +placeOrder(dto) Order
        +cancelOrder(id) void
    }

    class OrderRepository {
        <<repository>>
        +findById(id) Order
        +save(order)  void
    }

    OrderService ..> OrderRepository : uses
    OrderService ..> EventBus        : publishes
```

### Generic / Template Class

```
    class Repository~T~ {
        <<interface>>
        +findById(id) T
        +findAll()    T[]
        +save(e T)    void
    }
    class OrderRepository {
        <<repository>>
    }
    Repository~Order~ <|.. OrderRepository
```

### Inheritance Chain

```
    class Animal {
        <<abstract>>
        +String name
        +speak() String*
    }
    class Dog {
        +speak() String
    }
    class Cat {
        +speak() String
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `classDef` without `color:` | Always add `color:#fff` or `color:#000` |
| Relationships in wrong direction | `A --|> B` = A extends B; `A ..|> B` = A implements B |
| Missing stereotype on abstract/interface | Add `<<abstract>>` or `<<interface>>` |
| Field types missing | Always specify: `+String name` not just `+name` |
| Overcrowded single diagram | Split by layer (domain / service / infra) |
| Using `::` instead of `:::` for classDef | Apply style: `class Foo:::myStyle` (3 colons) |
