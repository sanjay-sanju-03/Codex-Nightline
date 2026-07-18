import { draftSchema, extractionSchema } from "@/schemas/work-log";
import type { WorkLogDraft } from "@/types/work-log";

export function normalizeExtraction(input: unknown): { parsed: WorkLogDraft; needsReview: boolean } {
  const source = extractionSchema.parse(input);
  const defaultedDate = !source.work_date;
  const parsed = draftSchema.parse({
    employer_name: source.employer_name.trim() || "Unknown",
    hours_worked: source.hours_worked,
    amount_paid: source.amount_paid,
    amount_pending: source.amount_pending,
    work_date: source.work_date || new Date().toISOString().slice(0, 10),
    notes: source.notes.trim(),
    verification_status: "draft",
  });
  return { parsed, needsReview: source.needs_review || defaultedDate || parsed.employer_name === "Unknown" };
}
