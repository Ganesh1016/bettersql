# SQL Playground

Local-first SQL Playground built with Next.js App Router and Server Actions.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Modes

1. `WASM` mode (in-browser SQLite via `sql.js`)
2. `File` mode (local SQLite file via `better-sqlite3` Server Actions)

## Seed Data

Seed SQL scripts are in `seeds/`:

- `seeds/ecommerce.sql`
- `seeds/hr.sql`
- `seeds/movies.sql`

Load them manually by pasting into the editor or importing `.sql` in WASM mode.

## File Mode Notes

- File mode requires an absolute path.
- Browsers do not expose full paths from file pickers; type the full path manually.
- `Create new .db` creates a database file on disk from the supplied absolute path.

## Local-Only Safety

This app is intended for local development only.

- Do not deploy this app to a public server.
- Server Actions can read/write local SQLite files by absolute path.

## Contributing

1. Fork and clone.
2. Run `npm install`.
3. Run `npm run dev`.
4. Submit a PR.

## License

MIT. See [LICENSE](LICENSE).

