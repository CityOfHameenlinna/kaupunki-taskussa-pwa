// db.js
import Dexie from "dexie";

export const db = new Dexie("ktdb");
db.version(3).stores({ libraryCard: "id", events: "id" , feeds:"id",mapData:"id",mapPlaceListData:"id"});

db.version(3).upgrade();