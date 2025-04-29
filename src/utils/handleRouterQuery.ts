export function handleRouterQuery(query: string | string[] | undefined) {
  if (query === undefined) {
    return "";
  }

  if (Array.isArray(query)) {
    return query.join("");
  }

  return query;
}
