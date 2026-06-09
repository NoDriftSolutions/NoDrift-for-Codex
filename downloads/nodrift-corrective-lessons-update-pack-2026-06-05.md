# NoDrift Corrective Lessons Update Pack

Update date: 2026-06-05

Status: User-safe update pack

## What This Is

NoDrift can preserve corrected LLM or workspace-agent communication errors as reusable lessons. When an error pattern is identified and corrected, the correction can be added to a NoDrift workspace so future sessions know what to watch for and how to respond.

This update pack does not include private chat transcripts or private project files. It contains user-safe corrective lessons, sanitized incident summaries, and instructions for applying the update.

## What To Add

Add this update pack to the NoDrift project memory area for the active project.

Recommended location:

`PROJECT_MEMORY/ERROR_TRAINING/UPDATES/`

If that folder does not exist, the user may ask the active workspace agent to create it inside the private project memory folder.

## Apply This Update

After adding this file to the project, the user may use this optional request:

```text
Read the latest NoDrift corrective lessons update. Apply the active lessons before continuing work. Do not replace the existing governance files. If any lesson conflicts with active governance, report the conflict before acting.
```

This is optional user-authored wording. NoDrift does not construct, alter, attach to, optimize, or govern outgoing user messages to an LLM.

## Active Corrective Lessons In This Update

### ND-LESSON-2026-06-04-001

Never say NoDrift sends instructions to the LLM, gives information to the LLM, controls the LLM, works inside the LLM, or changes the LLM's transmission.

Use:

```text
The LLM transmits. NoDrift governs reception. The user remains the authority.
```

### ND-LESSON-2026-06-04-002

When reviewing an error, identify the first errored comment and analyze the visible comments, context, image evidence, and instructions that came before it. Do not center later comments unless they are separately critical or needed to measure impact.

### ND-LESSON-2026-06-05-001

When precision matters, pause before answering and confirm the object, audience, and source of truth. If a deliverable has been discussed but has not yet been created, do not substitute a nearby existing artifact.

### ND-LESSON-2026-06-05-002

Classify the user's latest message by mode before producing a deliverable or taking action. If the latest message is a question, discussion point, correction, or objection, answer only that message and wait for explicit approval before rewriting, expanding, implementing, or editing.

### ND-LESSON-2026-06-05-003

After an error is corrected, extract the full operative correction sequence into the private error-training log and the appropriate aggregating error-classification branch. Future chats must be able to review the corrected lesson without searching the original conversation.

## Sanitized Incident Summary

This update was created from corrected NoDrift working-session errors involving:

- unsupported explanation of how NoDrift relates to LLMs;
- over-eager continuation after a discussion question;
- substituting an existing internal folder for a planned user-ready deliverable;
- missing extraction of corrected error conversations into a durable error-classification branch.

Private transcripts and project-specific details are not included.

## Boundary

This update improves operating discipline. It does not guarantee perfect LLM or workspace-agent behavior, complete error detection, or automatic correction without user review.
