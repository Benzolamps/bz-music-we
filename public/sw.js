if ('serviceWorker' in self) {
  ['install', 'fetch', 'activate'].forEach(h => self.addEventListener(h, () => 0));
}
