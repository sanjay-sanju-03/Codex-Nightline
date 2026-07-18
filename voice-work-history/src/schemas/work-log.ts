import { z } from "zod";

export const draftSchema = z.object({
  employer_name: z.string().trim().min(1).max(120),
  hours_worked: z.number().finite().min(0).max(24),
  amount_paid: z.number().finite().min(0),
  amount_pending: z.number().finite().min(0),
  work_date: z.string().date(),
  notes: z.string().max(500),
  verification_status: z.literal("draft"),
});

// Lenient schema for raw GPT output — .catch() means unexpected formats
// ("today", "₹500", "8 hrs") never throw; normalization cleans them up.
export const extractionSchema = z.object({
  employer_name: z.string().catch("Unknown"),
  hours_worked: z.coerce.number().finite().min(0).max(24).catch(0),
  amount_paid: z.coerce.number().finite().min(0).catch(0),
  amount_pending: z.coerce.number().finite().min(0).catch(0),
  work_date: z.string().catch(""),
  notes: z.string().max(500).catch(""),
  needs_review: z.boolean().catch(true),
});
