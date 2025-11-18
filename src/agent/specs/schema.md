# Universal UI Spec Format

Each node in the spec is a component with:

{
"type": "component-name",
"props": { ... },
"children": [ ... ]
}

## Supported Types

### 1. container

Used for layout.
Props:
{
"direction": "row" | "column",
"gap": number,
"padding": number,
"width": string,
"height": string
}

### 2. text

{
"value": "Hello world",
"variant": "h1" | "h2" | "body" | "small",
"weight": "normal" | "medium" | "bold"
}

### 3. button

{
"label": "Create Project",
"variant": "primary" | "secondary",
"size": "sm" | "md" | "lg"
}

### 4. card

{
"title": "...",
"description": "...",
"icon": "home" | "projects" | ...
}

### 5. sidebar

{
"items": [
{ "label": "Home", "icon": "home" },
{ "label": "Projects", "icon": "folder" }
]
}

### 6. header

{
"title": "Home"
}

### 7. list

{
"items": [ ... ]
}

### 8. grid

{
"columns": 2 | 3 | 4,
"items": [...]
}

## Pages wrap everything inside root container

{
"type": "page",
"children": [ ... ]
}
