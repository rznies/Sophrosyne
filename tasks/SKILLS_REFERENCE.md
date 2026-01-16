# Intent Gate — Amp Skills Reference & Workflows

**Status**: All snarktank/amp-skills installed to `~/.amp/skills/`  
**Installation Date**: Jan 16, 2026  
**Skills Available**: 7 documented skills + context-engineering-kit plugins

---

## ✅ Installed Skills Summary

### Core Development Skills (for Intent Gate MVP)

| Skill | Purpose | Status | Use When |
|-------|---------|--------|----------|
| **ralph** | Autonomous feature development | ✅ Installed | Need hands-off feature automation |
| **compound-engineering** | Plan → Work → Review → Compound | ✅ Installed | Large features needing structured workflow |
| **prd** | Generate Product Requirements Documents | ✅ Installed | Refining product specs (already have SPEC.md) |
| **frontend-design** | Production-grade interface design | ✅ Installed | Polishing UI/UX (Day 7 polish phase) |
| **agent-browser** | Browser automation + persistent state | ✅ Installed | Testing UI automation (optional) |
| **pdf** | PDF manipulation (extract, create, merge) | ✅ Installed | Export session data as PDF |
| **docx** | Word document creation & analysis | ✅ Installed | Export session data as Word doc |

### Context Engineering Kit (Plugins)
- **SADD** (Subagent-Driven Development) - `/sadd:launch-sub-agent`, `/sadd:do-in-parallel`
- **Kaizen** (Continuous Improvement) - `/kaizen:analyse`, `/kaizen:root-cause-tracing`
- **Reflexion** (Self-reflection) - Pre/post-tool hooks
- **Code Review** - PR review automation
- **TDD** - Test-driven development commands
- **Git** - Commit & PR creation helpers

---

## Recommended Skill Usage for Intent Gate Development

### Phase 1: Setup (Task 0–1)
**Skills to use**:
- None (basic setup)

### Phase 2: Feature Implementation (Tasks 2–6)
**Skills to use**:
```
/ralph setup
```
This launches Ralph (autonomous feature dev) for hands-off iteration on:
- Trigger apps management (Task 2)
- Schedule engine (Task 3)
- Accessibility service (Task 5)
- Gate overlay + sessions (Task 6)

**Alternative: Parallel sub-agents**
```
/sadd:do-in-parallel "Implement Task 2", "Implement Task 3"
```

### Phase 3: QA & Polish (Task 7)
**Skills to use**:
```
frontend-design setup
```
For refining UI/UX consistency, Material Design adherence, accessibility.

**For debugging & root cause analysis**:
```
/kaizen:root-cause-tracing
```
When tests fail or permissions act weird.

### Final Steps
**Create & document export formats**:
```
pdf export-sessions.pdf
docx export-sessions.docx
```

---

## Quick Command Reference

### Ralph (Autonomous Feature Development)
```bash
# Start Ralph for a feature
/ralph feature: implement-trigger-apps-management

# Ralph handles: planning, coding, testing, commit
```

### Compound Engineering (Plan → Work → Review)
```bash
# For large, structured tasks
/compound-engineering feature: complete-intent-gate-mvp
```

### SADD (Parallel Sub-agents)
```bash
# Run 2+ independent tasks in parallel
/sadd:do-in-parallel \
  "Implement Trigger Apps (Task 2)" \
  "Implement Schedule Engine (Task 3)" \
  "Create Expo Module skeleton (Task 4)"
```

### Kaizen (Root Cause Analysis)
```bash
# When something breaks
/kaizen:why "Gate overlay not showing"
/kaizen:root-cause-tracing "Permission denied errors"
```

### Frontend Design (Polish UI)
```bash
# When refining the gate overlay & screens
/frontend-design review: intent-gate-ui
```

### PDF/DOCX (Export Sessions)
```bash
# Export session data
/pdf create-from-query: select * from sessions
/docx create-report: weekly-analytics
```

---

## Development Workflow (Recommended)

### Day 1–3: Core Setup
```
1. Create feature branch (0.1)
2. Initialize Expo + SQLite (1.0)
3. Implement Trigger Apps (2.0)
4. Implement Schedule Engine (3.0)
```
**Skill**: None (standard development)

### Day 4–5: Native Integration
```
5. Set up Expo Module + Config Plugin (4.0)
6. Implement AccessibilityService (5.0)
7. Implement Gate Overlay (6.0)
```
**Skill**: `/ralph feature: implement-native-stack` (if hands-off needed)

### Day 6: Journal + Analytics
```
8. Implement Journal + Analytics (7.1–7.2)
9. Implement Onboarding Flows (7.3)
```
**Skill**: `/sadd:do-in-parallel` (journal and onboarding are independent)

### Day 7: Polish & QA
```
10. Permission Handling (7.4)
11. Settings + Export (7.5)
12. Error Handling (7.6)
13. Final Polish (7.7)
```
**Skill**: `/frontend-design review` + `/kaizen:root-cause-tracing` (if bugs)

---

## When to Use Each Skill

### Ralph (Autonomous Development)
**Use when**:
- You want the agent to autonomously implement + test a complete feature
- Feature is well-spec'd (✅ you have SPEC.md)
- You trust the implementation quality (minimal review)
- You're time-constrained

**Not recommended for**:
- Tasks requiring UI design decisions
- Security-critical code (permissions, native)
- First-time features with learning curve

### Compound Engineering
**Use when**:
- Feature is large (entire Intent Gate MVP)
- You want structured Plan → Work → Review → Compound loop
- You need checkpoints between phases

**Not recommended for**:
- Quick bug fixes
- Small features (< 4 hours)

### SADD (Parallel Sub-agents)
**Use when**:
- Multiple independent tasks (Trigger Apps + Schedule Engine)
- You need to speed up parallel work
- Tasks don't share state

**Not recommended for**:
- Dependent tasks (native integration must happen before overlay)

### Kaizen (Root Cause Analysis)
**Use when**:
- Tests fail mysteriously
- Behavior is unexpected (gate not showing, permissions errors)
- You need systematic debugging

### Frontend Design
**Use when**:
- Day 7 polish phase
- Refining colors, spacing, typography
- Accessibility review needed

---

## Checking Installed Skills

```bash
# List all installed skills
ls -la ~/.amp/skills/

# View README for usage
cat ~/.amp/skills/README.md

# View AGENTS.md for full reference
cat ~/.amp/skills/AGENTS.md
```

---

## Next Steps

1. **Start implementation** with tasks 0.1 – 1.0 (no skills needed)
2. **On Task 2.0**, consider using `/ralph` if you want autonomous feature automation
3. **On Day 7**, use `/frontend-design` for UI polish
4. **If bugs arise**, use `/kaizen:root-cause-tracing` for debugging

---

**All skills are ready to use. Load them naturally in your requests or explicitly with `/skill-name`.**
