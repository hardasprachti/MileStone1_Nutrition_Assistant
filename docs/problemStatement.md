# AI Nutrition Assistant Prototype

## Brief

Build the prototype of a chatbot that answers questions about food, nutrition, and food safety.

Nothing sits under it yet, so it answers from the model's own memory. It'll make things up, and you'll be writing down what it makes up.

---

## Where This Goes

**Milestone 2** slides a retrieval layer under this same app and turns every invented claim into a cited one.

The interface, endpoints, and response schema stay exactly as they are. You're building the container the citations land in.

---

## Why This One Comes First

Ask a model how much protein a vegetarian adult needs. The answer arrives in 2 seconds, sounds specific, and comes from nobody.

Ask again tomorrow and the number has moved. Ask what a health authority recommends and it will happily tell you, whether or not that authority ever said it.

> Food is a bad place for this to happen. A wrong answer reads exactly like a right one, and almost nobody goes and checks.

---

## What You Build

### 1. Chat Frontend

- A message list, an input box, and a **sources panel** next to the conversation.
- The sources panel stays **empty this week**. Build it now — Milestone 2 fills it.

---

### 2. Backend

- A chat endpoint
- Somewhere to store the conversation
- The model call

> **Keep the model call on your server, not in the browser.**

---

### 3. Response Schema

The model returns **structured output**, not prose.

The response must contain:

| Field | Type | Description |
|-------|------|-------------|
| `answer` | `string` | The answer text |
| `claims` | `array` | A list of individual claims made in the answer |

Each **claim** must contain:

| Field | Type | Description |
|-------|------|-------------|
| `claim_text` | `string` | The specific claim being made |
| `source` | `null` | Always `null` this week — deliberate placeholder |

> Every source comes back as `null` this week. That's deliberate.
> You're fixing the contract now so Milestone 2 only has to fill it in.

**Parse against the schema and fail when it doesn't parse.**

---

### 4. System Prompt

Write a system prompt that defines:

- What the assistant does
- How it answers
- How long its answers should be
- What it won't touch

> Keep a fixed set of questions and re-run all of them after every prompt change.
> Fixing one case while quietly breaking three others is the usual way this goes wrong.

---

### 5. Scope Limits — Enforced in Code

The assistant must **not** provide:

- Calorie or weight targets
- Recommendations about what anyone should weigh
- Medical advice

It should **decline** these questions and point the person to a qualified professional.

> A line in the prompt won't hold on its own — put the check in code as well.

---

### 6. Deploy

Push the project to GitHub and deploy using:

- **Vercel**
- **Railway**

---

### 7. The Failure Log

Write **10 questions** across these 4 categories:

1. Nutrient requirements
2. Food safety and storage
3. Cooking methods
4. Questions where nobody has a clear answer

Run all 10 questions. For each response, record:

| Failure Type | Description |
|---|---|
| **Unsubstantiated facts** | Claims stated as fact with nothing behind them |
| **Shifting numbers** | Numbers that shift between runs |
| **Phantom sources** | Sources it cited that you can't find |
| **Should have declined** | Questions it should have declined but answered |
| **Hedged into uselessness** | Questions where it hedged into uselessness |

**Group the failures and count them.**

---

## Project Milestones at a Glance

Milestone 1 (Prototype, no sources) --> [Same interface & schema] --> Milestone 2 (RAG Layer, cited answers)

---

## Key Constraints Summary

| Constraint | Detail |
|---|---|
| Model call location | Server-side only (never browser) |
| Source fields | `null` in Milestone 1 |
| Schema validation | Hard fail if response does not parse |
| Declined topics | Calorie targets, weight advice, medical advice |
| Scope enforcement | Both prompt **and** code |
