# BetterSQL

A local-first, zero-config SQL Playground built with Next.js and SQLite.

## Features

- **Instant (In-Memory) Mode**: Run SQLite queries directly in your browser with zero installation. Perfect for quick testing, learning SQL, or prototyping schemas.
- **File Mode**: Connect to local SQLite `.db` files on your disk for real development work.
- **Rich Editor**: Monaco-powered editor with SQL syntax highlighting, formatting, and partial query execution.
- **Schema Explorer**: Live view of your tables, columns, and types.
- **Query History**: Persistent history for each mode so you never lose a query.
- **Import/Export**: Easily move databases between your local disk and the Instant mode.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/bettersql.git
cd bettersql
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start writing SQL.

## Modes

### Instant (In-Memory)
This mode uses `sql.js` (SQLite compiled to WebAssembly). Everything stays in your browser's memory. You can enable "Persist in Browser" to save your state to `localStorage`.

### File Mode
This mode uses `better-sqlite3` on the server-side. It connects to actual files on your filesystem. You can use "Remember Changes in Browser" to cache your progress locally.

## License

MIT
