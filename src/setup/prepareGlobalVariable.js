export function prepareGlobalVariable(client) {
  window.fundooBrowserHistory = client.history;
  window.store = client.store;
  window.remToPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
}
