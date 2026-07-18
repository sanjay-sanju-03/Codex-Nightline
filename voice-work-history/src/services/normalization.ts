import { draftSchema, extractionSchema } from "@/schemas/work-log";
import type { WorkLogDraft } from "@/types/work-log";

function parseDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!dateStr) return today;

  // If it's already YYYY-MM-DD, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try parsing with Javascript Date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return today;
}

export function normalizeExtraction(input: unknown): { parsed: WorkLogDraft; needsReview: boolean } {
  let source;
  try {
    source = extractionSchema.parse(input);
  } catch {
    // If extractionSchema somehow fails, create an empty skeleton
    source = {
      employer_name: "Unknown",
      hours_worked: 0,
      amount_paid: 0,
      amount_pending: 0,
      work_date: "",
      notes: "",
      needs_review: true,
    };
  }

  const workDate = parseDate(source.work_date);
  const defaultedDate = !source.work_date || workDate !== source.work_date;

  const rawDraft = {
    employer_name: source.employer_name.trim() || "Unknown",
    hours_worked: Math.min(24, Math.max(0, source.hours_worked)),
    amount_paid: Math.max(0, source.amount_paid),
    amount_pending: Math.max(0, source.amount_pending),
    work_date: workDate,
    notes: source.notes.trim(),
    verification_status: "draft" as const,
  };

  let parsed: WorkLogDraft;
  try {
    parsed = draftSchema.parse(rawDraft);
  } catch {
    // Ultimate fallback if draftSchema still rejects the normalized data
    parsed = {
      employer_name: "Unknown",
      hours_worked: 0,
      amount_paid: 0,
      amount_pending: 0,
      work_date: new Date().toISOString().slice(0, 10),
      notes: "Error: Failed to normalize extraction data.",
      verification_status: "draft",
    };
  }

  return { 
    parsed, 
    needsReview: source.needs_review || defaultedDate || parsed.employer_name === "Unknown" 
  };
}

