# Deployment / Architecture Diagram Guide

Use for: infrastructure diagrams, cloud architecture, network topology, microservices layout, server-client relationships, Kubernetes clusters.

Mermaid does not have a native "deployment" type — use `flowchart LR` or `flowchart TD` with subgraphs to simulate deployment/architecture diagrams.

---

## Direction Choice

| Layout | Best for |
|--------|----------|
| `flowchart LR` | Horizontal pipeline, service mesh, data flow |
| `flowchart TD` | Layered architecture (client → server → DB) |
| `flowchart TB` | Same as TD |

---

## Node Shapes for Infrastructure

```
Client(["`👤 User<br>Browser / Mobile`"])        stadium — external actor
LB["`⚖️ Load Balancer<br>nginx`"]                rectangle — service
API[["`🖥 API Server<br>Spring Boot :8080`"]]     subroutine — compute node
DB[("`🗄 PostgreSQL<br>primary`")]               cylinder — database
Cache[("`⚡ Redis<br>cache`")]                   cylinder — cache
Queue>"`📨 RabbitMQ<br>orders queue`"]           flag — message queue
CDN{"`🌐 CDN<br>CloudFront`"}                    diamond — routing/CDN
CLOUD(["`☁️ AWS Region<br>us-east-1`"])           stadium — cloud boundary
```

---

## Subgraph Zones (Infrastructure Boundaries)

```
flowchart LR

    subgraph INTERNET ["🌐 Internet"]
        CLIENT(["`👤 Users`"])
    end

    subgraph DMZ ["🔒 DMZ / Edge"]
        LB["`⚖️ Load Balancer`"]
        CDN["`🌐 CDN`"]
    end

    subgraph APP ["⚙️ Application Tier"]
        direction TB
        API1["`🖥 API Server 1`"]
        API2["`🖥 API Server 2`"]
    end

    subgraph DATA ["🗄 Data Tier"]
        direction TB
        DB_PRIMARY[("`PostgreSQL<br>Primary`")]
        DB_REPLICA[("`PostgreSQL<br>Replica`")]
        CACHE[("`Redis<br>Cache`")]
    end

    CLIENT --> CDN
    CLIENT --> LB
    LB     --> API1
    LB     --> API2
    API1   --> CACHE
    API1   --> DB_PRIMARY
    API2   --> CACHE
    API2   --> DB_PRIMARY
    DB_PRIMARY -.->|replicate| DB_REPLICA
```

---

## Full Template

```
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#1e3a5f', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#0d2137', 'lineColor': '#4a90d9', 'background': '#0a1f33', 'nodeBorder': '#4a90d9', 'clusterBkg': '#0d2b44', 'edgeLabelBackground': '#0d2b44', 'fontFamily': 'Segoe UI, Arial, sans-serif', 'fontSize': '14px' } }}%%
flowchart LR
    %% ─── [System Name] Architecture ────────────────────────────
    %% Purpose: high-level deployment view

    %% ─── EXTERNAL ───────────────────────────────────────────────
    subgraph EXT ["🌐 External"]
        USER(["`👤 User<br>Web / Mobile`"])
    end

    %% ─── EDGE ───────────────────────────────────────────────────
    subgraph EDGE ["🔒 Edge"]
        LB["`⚖️ Load Balancer<br>nginx`"]
    end

    %% ─── SERVICES ───────────────────────────────────────────────
    subgraph SERVICES ["⚙️ Services"]
        direction TB
        AUTH[["`🔑 Auth Service<br>:3001`"]]
        API[["`🖥 API Service<br>:3000`"]]
        WORKER[["`⚙️ Worker<br>queue consumer`"]]
    end

    %% ─── DATA ───────────────────────────────────────────────────
    subgraph DATA ["🗄 Data"]
        direction TB
        DB[("`PostgreSQL<br>:5432`")]
        CACHE[("`Redis<br>:6379`")]
        QUEUE>"`RabbitMQ<br>:5672`"]
    end

    %% ─── EDGES ─────────────────────────────────────────────────
    USER    --> LB
    LB      --> AUTH
    LB      --> API
    API     --> CACHE
    API     --> DB
    API     --> QUEUE
    QUEUE   --> WORKER
    WORKER  --> DB
    AUTH    --> DB

    %% ─── STYLES ────────────────────────────────────────────────
    style USER   fill:#1565c0,stroke:#90caf9,stroke-width:2px,color:#fff
    style LB     fill:#e65100,stroke:#ffcc80,stroke-width:2px,color:#fff
    style DB     fill:#2e7d32,stroke:#a5d6a7,stroke-width:2px,color:#fff
    style CACHE  fill:#0277bd,stroke:#81d4fa,stroke-width:2px,color:#fff
    style QUEUE  fill:#4a148c,stroke:#ce93d8,stroke-width:2px,color:#fff
```

---

## Patterns

### Kubernetes Cluster

```
flowchart TD
    subgraph K8S ["☸️ Kubernetes Cluster"]
        subgraph NS_APP ["namespace: app"]
            POD1[["`🖥 api-pod-1`"]]
            POD2[["`🖥 api-pod-2`"]]
            SVC["`⚡ ClusterIP Service<br>api-svc:80`"]
        end
        subgraph NS_DATA ["namespace: data"]
            PG[("`🗄 postgres-pod`")]
            PVC["`💾 PersistentVolumeClaim`"]
        end
        INGRESS["`🔀 Ingress Controller<br>nginx`"]
    end

    INTERNET(["`🌐 Internet`"]) --> INGRESS
    INGRESS --> SVC
    SVC     --> POD1
    SVC     --> POD2
    POD1    --> PG
    POD2    --> PG
    PG      --- PVC
```

### Microservices with Event Bus

```
flowchart LR
    GW["`🔀 API Gateway`"]

    subgraph SERVICES ["Services"]
        direction TB
        USER_SVC[["`👤 User Service`"]]
        ORDER_SVC[["`📦 Order Service`"]]
        NOTIF_SVC[["`🔔 Notification Service`"]]
    end

    BUS>"`📨 Event Bus<br>Kafka`"]

    GW         --> USER_SVC
    GW         --> ORDER_SVC
    ORDER_SVC  --> BUS
    BUS        --> NOTIF_SVC
    BUS        --> USER_SVC
```

---

## Edge Labels for Infrastructure

```
A -->|HTTPS :443| B          protocol + port
A -->|REST| B                communication style
A -.->|async| B              async / event
A ==>|critical| B            critical path
A -->|replicate| B           data replication
A -->|mTLS| B                secure channel
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| No subgraph zones | Always group by tier: edge / app / data / external |
| All nodes same shape | Use cylinder for DB, subroutine for compute, stadium for actors |
| Missing port/protocol on edges | Label edges: `-->|HTTPS :443|` |
| `flowchart TD` for wide architectures | Use `flowchart LR` when >3 horizontal tiers |
| Forgetting `color:` in style | Light bg → dark text; dark bg → `color:#fff` |
| Too detailed in single diagram | One diagram per concern: overview + per-service detail |
