export function ensurePrefix(str, prefix) {
  if (!str.startsWith(prefix)) {
    return prefix + str;
  }
  return str;
}
