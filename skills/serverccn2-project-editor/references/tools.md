# ServerCCN2 Project Editor — Tools Reference

## Tool Usage by Command

### scan_server
| Tool | Purpose |
|------|---------|
| **Read** | Read `CLAUDE.md`, `build.gradle.kts`, `Main.kt`, `CCN2ModuleInitializer.kt`, `GameCfg.kt` |
| **Glob** | Find all `.kt` files in specific packages |
| **Grep** | Search for patterns: module registrations, config loaders, table definitions |
| **Agent (Explore)** | Deep exploration of `modules/`, `abilities/`, `config/` packages |
| **Bash** | List directories, count files, compare configs |

### edit_server_idea
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, Tech Doc, relevant source files |
| **Grep** | Find related implementations, usages, references |
| **Agent (Explore)** | Understand affected modules and dependencies |

### manage_config
| Tool | Purpose |
|------|---------|
| **Read** | Read `server.properties` from all environments |
| **Edit** | Modify `server.properties` preserving format |
| **Write** | Create new environment config files |
| **Bash** | Create directories, copy template files |
| **Glob** | Find all config files across environments |
| **Grep** | Search for specific config values across envs |

### generate_server_code
| Tool | Purpose |
|------|---------|
| **Read** | Read target files and existing patterns |
| **Write** | Create new Kotlin source files |
| **Edit** | Modify existing files (registrations, imports) |
| **Bash** | Run tests (`./gradlew test`), build (`./gradlew run`) |

### check_server_consistency
| Tool | Purpose |
|------|---------|
| **Read** | Read GDD, config JSONs, source code |
| **Grep** | Search for constant values in code |
| **Agent (Explore)** | Cross-reference values across codebase |

### review_deploy
| Tool | Purpose |
|------|---------|
| **Read** | Read target env configs |
| **Bash** | Run tests, check build status |
| **Grep** | Verify no debug code in production paths |

### manage_resources
| Tool | Purpose |
|------|---------|
| **Read** | Read JSON resource files, config loaders |
| **Write** | Create new JSON resources |
| **Edit** | Modify existing JSON resources |
| **Grep** | Find references to resources in GameCfg and code |

### validate_result
| Tool | Purpose |
|------|---------|
| **Bash** | Run `./gradlew compileKotlin`, `./gradlew test`, count files, config checks |
| **Grep** | Verify registrations in CCN2ModuleInitializer, GameCfg, CmdDefine |
| **Glob** | Verify file paths cited in output actually exist |
| **Read** | Spot-check: read random files to verify content matches output claims |

---

## Key File Paths Quick Reference

### Source Code
```
serverccn2/src/main/kotlin/org/ccn2/Main.kt
serverccn2/src/main/kotlin/org/ccn2/CCN2ModuleInitializer.kt
serverccn2/src/main/kotlin/org/ccn2/config/GameCfg.kt
serverccn2/src/main/kotlin/org/ccn2/modules/CmdDefine.kt
serverccn2/src/main/kotlin/org/ccn2/sql/SqlConnector.kt
serverccn2/src/main/kotlin/org/ccn2/sql/SqlVersioning.kt
```

### Configurations
```
serverccn2/config/server.properties           # Local
serverccn2/configByMode/dev/config/           # Dev environment
serverccn2/configByMode/dev2/config/          # Dev2
serverccn2/configByMode/dev3/config/          # Dev3
serverccn2/configByMode/qc/config/            # QC
serverccn2/configByMode/qc2/config/           # QC2
serverccn2/configByMode/qc3/config/           # QC3
serverccn2/configByMode/live/config/          # Production
```

### Resources
```
serverccn2/res/*.json                         # All game resource JSONs
serverccn2/res/localize/                      # Localization files
```

### Build
```
serverccn2/build.gradle.kts                   # Build configuration
serverccn2/settings.gradle.kts                # Project settings
```

### Tests
```
serverccn2/src/test/kotlin/testcase/          # Integration tests
serverccn2/src/test/kotlin/testcase/replay/   # Replay tests
serverccn2/src/test/kotlin/testpack/          # Test tools
serverccn2/src/test/kotlin/test_utils/        # Test utilities
serverccn2/src/test/kotlin/unversioned/       # Quick tests
```

### Documents
```
document/GameDesignDocument.md                # GDD (authoritative)
TechnicalArchitectureDocument.md              # Architecture doc
serverccn2/doc/CodeDesignLinks.md             # External doc links
CLAUDE.md                                     # Project conventions
```

---

## Gradle Commands Reference

```bash
# Development
./gradlew run                    # Full build + generate + run
./gradlew runNoGenerate          # Run without code generation
./gradlew quickRun               # Run without recompile
./gradlew test                   # Run all tests
./gradlew commander              # Interactive CLI test runner

# Code Generation
./gradlew copyMSerializerJs      # Generate MSerializer.js for client
./gradlew generateItemGroup      # Generate ItemGroup.json for client

# Deploy (7 environments)
./gradlew deployDev              # Full deploy to dev
./gradlew deployDev2
./gradlew deployDev3
./gradlew deployQc               # Full deploy to QC
./gradlew deployQc2
./gradlew deployQc3
./gradlew deployLive             # Full deploy to production

# Config-only deploy (no recompile)
./gradlew deployConfigDev
./gradlew deployConfigQc
./gradlew deployConfigLive

# Quick tests
./gradlew unversioned            # Run unversioned tests
./gradlew unversionedQuick       # Quick unversioned tests
```

---

## Config Validation Rules

### server.properties

| Field | Rule | Severity |
|-------|------|----------|
| `dao_type` | Must be `file`/`simple`/`delegate`/`shard` | CRITICAL |
| `dao_type` | `file` only in local dev | CRITICAL |
| `dao_type` | `shard` recommended for production | WARNING |
| `db_prefix_key` | Must be unique across all environments | CRITICAL |
| `db_index_node` | Must not equal all `db_shard_nodes` | WARNING (single point of failure) |
| `port` | Must be numeric, typically 443 (deployed) or 1102 (local) | INFO |
| `env` | Must be `DEV`/`PRIVATE`/`QC`/`LIVE` | WARNING |
| `idle_reader_after_login` | Must be > client ping interval | WARNING |
| `max_client_data_size` | Default 131072 (128KB) | INFO |
| `protocol_compression_threshold` | Must be >= 1400 (MSS) | WARNING |

### Environment Creation Checklist

- [ ] Directory created: `configByMode/{name}/config/`
- [ ] `server.properties` copied from template
- [ ] `Server.json` copied from template
- [ ] `admin.json` copied from template
- [ ] `log4j2.xml` copied from template
- [ ] `db_prefix_key` updated to unique value
- [ ] `env` updated appropriately
- [ ] `dao_type` set (not `file` for deployed envs)
- [ ] DB connection settings configured
- [ ] Deploy Gradle task added to `build.gradle.kts` (optional)
