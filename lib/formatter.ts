import { format } from "sql-formatter";

export function formatSql(sql: string) {
  return format(sql, { language: "sqlite", tabWidth: 2 });
}

