# Graph Report - .  (2026-06-23)

## Corpus Check
- 49 files · ~160,739 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 170 nodes · 167 edges · 29 communities (15 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.75)
- Token cost: 107,419 input · 2,573 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Components|Frontend Components]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_NSE Service Tests|NSE Service Tests]]
- [[_COMMUNITY_Backend Core Server|Backend Core Server]]
- [[_COMMUNITY_Chart Data Tests|Chart Data Tests]]
- [[_COMMUNITY_Frontend Scripts|Frontend Scripts]]
- [[_COMMUNITY_Frontend Dev Dependencies|Frontend Dev Dependencies]]
- [[_COMMUNITY_Quote Detail Flow|Quote Detail Flow]]
- [[_COMMUNITY_Frontend UI Dependencies|Frontend UI Dependencies]]
- [[_COMMUNITY_NSE API Fetch|NSE API Fetch]]
- [[_COMMUNITY_WebSocket Tests|WebSocket Tests]]
- [[_COMMUNITY_General Assets|General Assets]]
- [[_COMMUNITY_GenAI & Assets|GenAI & Assets]]
- [[_COMMUNITY_Bank WebSocket Messages|Bank WebSocket Messages]]
- [[_COMMUNITY_Bank WebSocket Connect|Bank WebSocket Connect]]
- [[_COMMUNITY_Index WebSocket Messages|Index WebSocket Messages]]
- [[_COMMUNITY_General WebSocket|General WebSocket]]
- [[_COMMUNITY_Browser WebSocket Test|Browser WebSocket Test]]
- [[_COMMUNITY_Frontend Entrypoint|Frontend Entrypoint]]
- [[_COMMUNITY_VSCode Settings|VSCode Settings]]
- [[_COMMUNITY_Hero Image|Hero Image]]
- [[_COMMUNITY_Icons Image|Icons Image]]
- [[_COMMUNITY_React SVG|React SVG]]
- [[_COMMUNITY_Stock Island Logo|Stock Island Logo]]
- [[_COMMUNITY_Vite SVG|Vite SVG]]

## God Nodes (most connected - your core abstractions)
1. `api` - 6 edges
2. `scripts` - 5 edges
3. `nseFetch()` - 4 edges
4. `nseFetch()` - 3 edges
5. `nseFetch()` - 3 edges
6. `Supply Chain Diagram` - 3 edges
7. `Tech Stock Graph` - 3 edges
8. `React + Vite Template` - 3 edges
9. `{ Pool }` - 2 edges
10. `initializeDB()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Fed Pause Analysis Image` --conceptually_related_to--> `React + Vite Template`  [INFERRED]
  public/fed_pause.png → README.md
- `Mobile Updates Image` --conceptually_related_to--> `React + Vite Template`  [INFERRED]
  public/mobile_updates.png → README.md
- `Options Basics Image` --conceptually_related_to--> `React + Vite Template`  [INFERRED]
  public/options_basics.png → README.md
- `NSE Market Analytics Dashboard` --references--> `Favicon`  [EXTRACTED]
  index.html → public/favicon.svg
- `NSE Market Analytics Dashboard` --calls--> `Main Entry Point`  [EXTRACTED]
  index.html → src/main.jsx

## Import Cycles
- None detected.

## Communities (29 total, 14 thin omitted)

### Community 1 - "Backend Dependencies"
Cohesion: 0.11
Nodes (18): author, dependencies, axios, bcryptjs, cors, dotenv, express, jsonwebtoken (+10 more)

### Community 2 - "NSE Service Tests"
Cohesion: 0.13
Nodes (12): axios, cookies, getHeaders(), initSession(), nseFetch(), nseService, axios, nseService (+4 more)

### Community 3 - "Backend Core Server"
Cohesion: 0.16
Nodes (11): initializeDB(), { Pool }, seedUserPortfolio(), app, bcrypt, cache, cors, express (+3 more)

### Community 4 - "Chart Data Tests"
Cohesion: 0.22
Nodes (9): axios, cookies, getHeaders(), initSession(), nseFetch(), nseService, content, fs (+1 more)

### Community 5 - "Frontend Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 6 - "Frontend Dev Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 8 - "Frontend UI Dependencies"
Cohesion: 0.22
Nodes (9): dependencies, autoprefixer, lucide-react, postcss, react, react-dom, react-is, recharts (+1 more)

### Community 9 - "NSE API Fetch"
Cohesion: 0.38
Nodes (6): axios, cookies, getHeaders(), initSession(), nseFetch(), nseService

### Community 11 - "General Assets"
Cohesion: 0.50
Nodes (4): Fed Pause Analysis Image, Mobile Updates Image, Options Basics Image, React + Vite Template

### Community 12 - "GenAI & Assets"
Cohesion: 0.83
Nodes (4): Google Generative AI, Supply Chain Diagram, SynthID Watermark, Tech Stock Graph

### Community 18 - "Frontend Entrypoint"
Cohesion: 0.67
Nodes (3): Favicon, NSE Market Analytics Dashboard, Main Entry Point

## Knowledge Gaps
- **92 isolated node(s):** `axios`, `cookies`, `nseService`, `axios`, `cookies` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Frontend Dev Dependencies` to `Frontend Scripts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend UI Dependencies` to `Frontend Scripts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `axios`, `cookies`, `nseService` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `NSE Service Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._