// Mock Service Worker polyfill
require("whatwg-fetch");

// Dexie and fake-indexeddb import
const Dexie = require("dexie");
Dexie.dependencies.indexedDB = require("fake-indexeddb");
Dexie.dependencies.IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

// // Enzyme setup
// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';

// Enzyme.configure({ adapter: new Adapter() });