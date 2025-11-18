export const uiSpecPrompt = (html: string, styles: any[]) => `
You are an expert Frontend Architect. Your task is to convert
DOM + CSS extracted from a real web application into a clean,
structured, fully nested UNIVERSAL UI SPEC JSON.

This JSON will be used by an automatic UI generator
(React + Tailwind) to recreate the interface.

---

### RULES FOR OUTPUT

1. Output only JSON (no explanations)
2. Use the UNIVERSAL SPEC format:

{
  "type": "page",
  "children": [ ... ]
}

Components allowed:
- page
- container
- header
- sidebar
- text
- card
- button
- grid
- list

---

### LAYOUT RULES

1. High-level layout:
- header at top
- sidebar on left (if exists)
- main content in a column container

2. Convert sections/buttons/cards/lists to equivalent spec nodes.

3. Compute hierarchy:
- detect horizontal vs vertical groups
- detect grid-like content (cards)

4. Do NOT include styling details:
NO raw CSS, NO classes, NO colors, NO pixel positions.

5. Use semantics:
- headings become text (variant: "h1" / "h2")
- sections become container
- card-like blocks become card
- repeated items become list

---

### INPUT DOM
${html.slice(0, 40000)}

### INPUT STYLES (partial)
${JSON.stringify(styles.slice(0, 200), null, 2)}

---

### OUTPUT
Return ONLY valid JSON following the universal UI spec format.
`;
