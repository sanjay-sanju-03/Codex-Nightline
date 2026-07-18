export type WorkLogDraft = {
  employer_name: string;
  hours_worked: number;
  amount_paid: number;
  amount_pending: number;
  work_date: string;
  notes: string;
  verification_status: "draft";
};

export type WorkLog = Omit<WorkLogDraft, "verification_status"> & {
  id: string;
  source_transcript: string;
  verification_status: "worker_confirmed";
  created_at: string;
  updated_at: string;
  follow_up_date?: string;
};

export type ParseResponse = {
  success: true;
  transcript: string;
  parsed: WorkLogDraft;
  needsReview: boolean;
  usedFallback: boolean;
};
