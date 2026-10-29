# Browser Chess

A compact, browser-based chess exercise built as a single HTML file. The interface is in Turkish and the game runs locally without a build step or external dependencies.

## Features

- Two-player play on the same device
- Legal-move highlighting and king-safety checks
- Castling, en passant, and pawn promotion logic
- Checkmate and stalemate detection
- One-move-at-a-time undo history

## Run locally

Open [`index.html`](index.html) in a modern browser, or serve the directory with any static file server. For example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
.
├── index.html  # Markup, styling, and game logic
└── README.md
```

## Scope

This is a small learning project rather than a chess engine or online multiplayer application. Game state is kept in memory and resets when the page is refreshed.
