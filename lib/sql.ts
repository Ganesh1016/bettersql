export function splitSqlStatements(input: string) {
  const statements: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      current += char;
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === "*" && next === "/") {
        current += "/";
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (!inSingle && !inDouble) {
      if (char === "-" && next === "-") {
        current += "--";
        i += 1;
        inLineComment = true;
        continue;
      }

      if (char === "/" && next === "*") {
        current += "/*";
        i += 1;
        inBlockComment = true;
        continue;
      }
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      current += char;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
      continue;
    }

    if (char === ";" && !inSingle && !inDouble) {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = "";
      continue;
    }

    current += char;
  }

  const remainder = current.trim();
  if (remainder.length > 0) statements.push(remainder);

  return statements;
}

export function isQueryStatement(sql: string) {
  return /^(select|pragma|with|explain)\b/i.test(sql.trim());
}

