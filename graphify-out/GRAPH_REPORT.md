# Graph Report - .  (2026-08-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 79 nodes · 74 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a285192a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `include` - 7 edges
3. `scripts` - 5 edges
4. `lib` - 4 edges
5. `ignoreScripts` - 3 edges
6. `trustedDependencies` - 3 edges
7. `next` - 2 edges
8. `react` - 2 edges
9. `react-dom` - 2 edges
10. `@tailwindcss/postcss` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (12 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (15): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, module, moduleResolution (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.32
Nodes (7): ignoreScripts, name, private, trustedDependencies, version, sharp, unrs-resolver

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (7): next, dependencies, next, react, react-dom, react, react-dom

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (4): dom, dom.iterable, esnext, lib

## Knowledge Gaps
- **48 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `Community 1` to `Community 2`, `Community 7`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._