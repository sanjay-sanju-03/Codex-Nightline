"use client";

import { openDB } from "idb";
import type { WorkLog } from "@/types/work-log";

const DB_NAME = "voice-work-history";
const STORE = "work-logs";

async function database() {
  return openDB(DB_NAME, 1, { upgrade(db) { if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" }); } });
}

export async function getLogs(): Promise<WorkLog[]> {
  return (await (await database()).getAll(STORE)).sort((a, b) => b.work_date.localeCompare(a.work_date));
}

export async function putLog(log: WorkLog) { await (await database()).put(STORE, log); }
export async function deleteLog(id: string) { await (await database()).delete(STORE, id); }
