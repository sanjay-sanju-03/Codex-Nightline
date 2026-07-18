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

export const extractionSchema = draftSchema.omit({ verification_status: true }).extend({ needs_review: z.boolean() });
