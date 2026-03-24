export interface ExtractedCommitment {
  text: string;
  deadline?: string;
  amount?: number;
  owner?: string;
}

export async function extractCommitments(transcript: string): Promise<ExtractedCommitment[]> {
  // Return mock extracted commitments
  return [
    {
      text: "Deliver project proposal",
      deadline: "2026-03-21",
      amount: 15000,
      owner: "John Smith"
    },
    {
      text: "Handle design work",
      deadline: "2026-03-20",
      owner: "Sarah"
    },
    {
      text: "Schedule follow-up meeting",
      owner: "John Smith"
    }
  ];
}
