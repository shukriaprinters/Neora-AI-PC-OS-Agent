---
name: Chat tab layout architecture
description: Why the command center section is on the 'home' tab, not the 'chat' tab
---

The command center section (metric cards + system journal) used to render above ChatView on the 'chat' tab. It consumed ~380px of the ~600px available viewport, leaving only ~200px for ChatView. Because `main#main-content` uses `overflow-hidden`, the squeezed ChatView's input and messages were invisible below the fold.

**Fix:** Created a dedicated `home` (Dashboard) tab. The section is now `{activeTab === 'home' && <section className="flex-1 overflow-y-auto min-h-0">`. The main content wrapper is `{activeTab !== 'home' && <main ...>`, so on the chat tab ChatView always gets the full remaining height.

**Why:** The section and main both have `flex-1` inside a `flex-col h-screen` container. Only one can fill the remaining space at a time. Putting them on separate tabs is the clean architectural solution.

**How to apply:** If you ever need to add another "full-page widget" section above main content, give it its own tab instead of conditionally inserting it above `<main>`.
