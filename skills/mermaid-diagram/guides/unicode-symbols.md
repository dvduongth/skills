# Unicode Semantic Symbols Guide

Use emoji/unicode icons in node labels to convey meaning at a glance without extra text. Makes diagrams readable faster, especially for designers.

**Usage:** prefix or suffix the node label text inside backtick labels.

```
A["`☁️ AWS S3<br>object storage`"]
B["`🔒 Auth Service<br>JWT validation`"]
```

---

## Infrastructure & Cloud

| Symbol | Meaning | Usage |
|--------|---------|-------|
| ☁️ | Cloud / cloud service | AWS, GCP, Azure, any cloud |
| 🌐 | Internet / CDN / public network | External access, CDN node |
| 🖥 | Server / compute / VM | API server, app server |
| 💻 | Laptop / developer | Local dev, developer actor |
| 📱 | Mobile device | Mobile app, iOS/Android |
| ⚖️ | Load balancer | nginx, HAProxy |
| 🔀 | Gateway / router / proxy | API gateway, reverse proxy |
| ☸️ | Kubernetes | K8s cluster, pod |
| 🐳 | Docker / container | Container, Docker image |
| ⚡ | Cache / fast storage | Redis, Memcached |
| 💾 | Disk / persistent storage | Volume, PVC, file storage |
| 🗄 | Database | PostgreSQL, MySQL, MongoDB |
| 📨 | Message queue / event bus | RabbitMQ, Kafka, SQS |
| 🔧 | Config / settings service | Configuration center |
| 📊 | Monitoring / metrics | Prometheus, Grafana |
| 📋 | Log / audit | Logging service, ELK |

---

## Security & Access

| Symbol | Meaning | Usage |
|--------|---------|-------|
| 🔒 | Secure / locked | Auth, HTTPS, encrypted |
| 🔑 | Authentication / key | Auth service, JWT, token |
| 🛡 | Security / protection | Firewall, WAF, shield |
| 👁 | Monitoring / audit | Audit log, observer |
| ⚠️ | Warning / caution | Risk, deprecated, attention |
| 🚫 | Blocked / forbidden | 403, access denied |
| ✅ | Verified / success | Auth ok, validated |
| ❌ | Error / failed | Error state, rejected |

---

## Data & Processing

| Symbol | Meaning | Usage |
|--------|---------|-------|
| 📦 | Package / bundle / order | Order entity, artifact |
| 📄 | Document / file | Report, PDF, file |
| 📁 | Folder / directory | S3 bucket, folder |
| 🔄 | Sync / loop / refresh | Polling, sync, cascade |
| ⚙️ | Process / worker / config | Background worker, job |
| 🧮 | Calculation / computation | Formula, algorithm |
| 🔍 | Search / query | Search service, filter |
| 📤 | Upload / send out | Export, push, publish |
| 📥 | Download / receive | Import, pull, consume |
| 🗑 | Delete / trash | Remove, purge, evict |

---

## People & Actors

| Symbol | Meaning | Usage |
|--------|---------|-------|
| 👤 | Single user / actor | User, customer, player |
| 👥 | Group / team | Admin group, team |
| 🤖 | Bot / automated | Worker, bot, automated job |
| 👑 | Admin / owner / leader | Admin role, superuser |
| 🎮 | Player / game | Game actor, player entity |

---

## Status & States

| Symbol | Meaning | Usage |
|--------|---------|-------|
| 🟢 | Active / running / online | Service healthy |
| 🔴 | Error / down / failed | Service unhealthy |
| 🟡 | Warning / degraded | Partial failure |
| ⏳ | Pending / waiting | Queue, timeout pending |
| 🏁 | Finish / complete | End state, done |
| 🚀 | Deploy / launch / start | Release, startup |

---

## Domain-Specific (Game Dev)

| Symbol | Meaning | Usage |
|--------|---------|-------|
| ⚔️ | Attack / combat | Attack action, damage |
| 🛡 | Defense / block | Defense stat, shield |
| ❤️ | Health / HP | HP bar, health system |
| 💙 | Mana / MP | Mana pool, MP cost |
| ⭐ | Star / bonus / power | Star rating, power-up |
| 🔥 | Fire element | Fire damage, combo |
| 💧 | Water element | Water ability |
| ⚡ | Lightning / electric | Electric attack |
| 🌿 | Earth / nature element | Nature/earth ability |
| 🌀 | Combo / spin / loop | Combo mechanic, vortex |
| 💥 | Explosion / impact | AoE, burst damage |
| 🎯 | Target / aim | Hit, accuracy, targeting |

---

## Usage Rules

1. **One symbol per node** — don't stack multiple emojis
2. **Prefix the label** — `🔒 Auth Service` not `Auth Service 🔒`
3. **Consistent meaning** — same symbol = same concept across all diagrams in a project
4. **Don't replace text** — symbols supplement, not replace label text
5. **Test rendering** — some emoji render differently across OS; test in mermaid.live

---

## Quick Picks by Diagram Type

**Infrastructure diagram:**
```
👤 User  →  🌐 CDN  →  ⚖️ LB  →  🖥 API  →  🗄 DB
                                          ↓
                                       ⚡ Cache
```

**Auth flow:**
```
👤 User  →  🔑 Auth  →  ✅ Token issued
              ↓ (fail)
            🚫 401 Rejected
```

**Game flow:**
```
🎮 Player  →  ⚔️ Attack  →  💥 Hit  →  ❤️ HP update
```
