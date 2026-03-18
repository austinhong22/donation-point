---
name: poc-reviewer
description: Use when asked to review the fair-donation-point-poc for correctness, data integrity, validation gaps, missing tests, demo readiness, or flow consistency across backend and frontend.
---

# PoC Reviewer

Use this skill when reviewing this repository.

## Review Priorities

- Data integrity around ledger-based point movement
- Invalid or missing state transition validation
- Gaps between donor allocation, charity usage, and admin fulfillment
- Missing tests on high-risk backend behavior
- UI gaps that block the main local demo flow

## Review Style

- Findings first, ordered by severity.
- Call out file and line references.
- Focus on bugs, regressions, integrity risks, and demo blockers.
- Keep summary short after findings.

## Verify

- Check backend tests/build path when backend changed.
- Check frontend build path when frontend changed.
- Confirm the main demo story still makes sense end-to-end.
