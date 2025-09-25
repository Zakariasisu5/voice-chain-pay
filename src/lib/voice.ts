export function parseApprovalCommand(transcript: string) {
  // Very small heuristic parser for phrases like:
  // "Approve 0.5 ETH to Alice on BNB Chain"
  const lower = transcript.toLowerCase();
  const approve = /approve\s+([0-9]*\.?[0-9]+)\s*([a-zA-Z0-9]+)\s+to\s+([a-zA-Z0-9\s]+)(?:\s+on\s+([a-zA-Z0-9\s]+))?/.exec(lower);
  if (!approve) return null;
  const amount = approve[1];
  const token = approve[2];
  const recipient = approve[3].trim();
  const chain = (approve[4] || '').trim();
  return { amount, token, recipient, chain };
}
