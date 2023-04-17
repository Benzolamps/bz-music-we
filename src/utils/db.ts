import Dexie from 'dexie';

const db = new Dexie('BzMusic');

// Declare tables, IDs and indexes
db.version(1).stores({
  settings: 'id',
  music: 'id',
  dir: 'id'
});

export default db;
