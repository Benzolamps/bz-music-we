const store: Record<string, unknown> = new Proxy({}, {
  get(target, property: string) {
    const json = localStorage.getItem(property);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  },
  set(target, property: string, value) {
    const json = JSON.stringify(value);
    localStorage.setItem(property, json);
    return true;
  },
  deleteProperty(target, property: string) {
    localStorage.removeItem(property);
    return true;
  }
});

export default store;
 