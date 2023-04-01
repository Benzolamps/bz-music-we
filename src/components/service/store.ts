import db from '@/utils/db';


const obj = {id: 'BzMusic'.hash()};

(async () => {
  const res = await db.table('settings').get(obj.id);
  Object.assign(obj, res ?? {});
})();

const store: Record<string, unknown> = new Proxy(obj, {
  get(target, property: string) {
    return target[property];
  },
  set(target, property: string, value) {
    target[property] = value;
    db.table('settings').put(obj);
    return true;
  },
  deleteProperty(target, property: string) {
    delete target[property];
    db.table('settings').put(obj);
    return true;
  }
});

export default store;
