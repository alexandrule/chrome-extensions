# Claude-Mem Usage Guide & Best Practices

A guide for using Claude-Mem, a persistent memory plugin for Claude Code.

## Overview

Claude-Mem automatically captures and retrieves context across Claude Code sessions. It records observations about your work (bugs fixed, features added, discoveries made) and injects relevant context into future sessions.

## How It Works

### Automatic Recording

Claude-Mem hooks into Claude Code's lifecycle:

| Event | Action |
|-------|--------|
| Session Start | Injects relevant past context |
| Tool Use | Captures what Claude reads/writes/executes |
| Session End | Generates a summary checkpoint |

### Observation Types

Work is categorized into 6 types:

- **Bugfix** - Something was broken, now fixed
- **Feature** - New capability added
- **Refactor** - Code restructured, behavior unchanged
- **Change** - Generic modifications (docs, config)
- **Discovery** - Learning about existing code
- **Decision** - Architectural choice with rationale

### Knowledge Concepts

Observations are tagged with concepts:

- `how-it-works` - Understanding mechanisms
- `why-it-exists` - Purpose or rationale
- `what-changed` - Modifications made
- `problem-solution` - Issues and fixes
- `gotcha` - Traps or edge cases
- `pattern` - Reusable approaches
- `trade-off` - Pros/cons of decisions

## Using the Search Tools

Claude-Mem provides MCP tools for searching memory. Follow the **3-layer workflow** for token efficiency:

### Step 1: Search

```
search(query, project, type, obs_type, dateStart, dateEnd)
```

Returns a lightweight index with observation IDs.

**Parameters:**
- `query` - Search text
- `project` - Filter by project name
- `type` - Filter by observation type
- `obs_type` - Alternative type filter
- `dateStart/dateEnd` - Date range filters
- `limit` - Max results
- `offset` - Pagination offset

### Step 2: Timeline

```
timeline(anchor=ID, depth_before, depth_after)
```

Gets context around a specific observation.

**Parameters:**
- `anchor` - Observation ID to center on
- `query` - Alternative: finds anchor automatically
- `depth_before/depth_after` - How many surrounding observations

### Step 3: Get Observations

```
get_observations([IDs])
```

Fetches full details for specific observation IDs.

**Parameters:**
- `ids` - Array of observation IDs (required)
- `orderBy` - Sort order
- `limit` - Max results

### Example Workflow

```
1. search(query="authentication bug")
   → Returns: [{id: 42, title: "Fixed JWT..."}, {id: 89, title: "Auth flow..."}]

2. get_observations([42, 89])
   → Returns full narratives, facts, files modified
```

## Best Practices

### 1. Let It Work Automatically

Claude-Mem captures context without intervention. The most effective approach is simply using Claude Code normally - observations are recorded automatically.

### 2. Use Descriptive Commit Messages

Since Claude-Mem captures tool outputs, descriptive git commits and clear code comments become part of your searchable memory.

### 3. Search Before Starting Complex Tasks

When resuming work or tackling related problems:

```
"Search my memory for previous work on [topic]"
```

This surfaces relevant past decisions and implementations.

### 4. Reference Past Decisions

When making architectural choices, search for previous decisions:

```
"What decisions have I made about [component/pattern]?"
```

### 5. Project-Specific Context

Claude-Mem tracks observations by project. When switching projects, context injection automatically focuses on that project's history.

### 6. Review Session Summaries

Session summaries capture:
- What was requested
- What was investigated
- What was learned
- What was completed
- Next steps

Search summaries for high-level project history.

## Configuration

Settings are in `~/.claude-mem/settings.json`:

| Setting | Default | Description |
|---------|---------|-------------|
| `CLAUDE_MEM_MODEL` | claude-sonnet-4-5 | LLM for processing observations |
| `CLAUDE_MEM_CONTEXT_OBSERVATIONS` | 50 | Observations injected per session |
| `CLAUDE_MEM_CONTEXT_FULL_COUNT` | 5 | Full observations shown |
| `CLAUDE_MEM_CONTEXT_SESSION_COUNT` | 10 | Session summaries shown |
| `CLAUDE_MEM_SKIP_TOOLS` | TodoWrite,Skill,... | Tools to ignore |
| `CLAUDE_MEM_LOG_LEVEL` | INFO | Logging verbosity |

## Data Locations

| Path | Contents |
|------|----------|
| `~/.claude-mem/claude-mem.db` | SQLite database |
| `~/.claude-mem/vector-db/` | Chroma embeddings |
| `~/.claude-mem/settings.json` | Configuration |
| `~/.claude-mem/logs/` | Daily log files |

## Troubleshooting

### Worker Not Starting

Check if the worker is running:
```bash
curl http://127.0.0.1:37777/api/health
```

Check PID file: `~/.claude-mem/worker.pid`

### Context Not Injecting

1. Verify settings.json exists
2. Check log files for errors
3. Ensure database has observations:
   ```bash
   sqlite3 ~/.claude-mem/claude-mem.db "SELECT COUNT(*) FROM observations;"
   ```

### Search Returns No Results

- Try broader search terms
- Remove date filters
- Check project name matches

## Token Efficiency

The 3-layer search workflow minimizes token usage:

1. **Search** returns ~50-100 tokens per result (just IDs and titles)
2. **Timeline** adds surrounding context selectively
3. **Get Observations** fetches full details only for filtered IDs

**Anti-pattern:** Don't fetch all observations then filter - this wastes tokens.

**Best practice:** Filter with search first, then fetch only what you need.

## Privacy Note

All data is stored locally in `~/.claude-mem/`. No data is sent to external servers beyond the configured LLM provider for observation processing.
