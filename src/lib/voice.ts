export interface VoiceCommand {
  action: 'approve' | 'reject' | 'request' | 'check' | 'list' | 'help';
  amount?: string;
  token?: string;
  recipient?: string;
  chain?: string;
  requestId?: string;
  reason?: string;
}

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const lower = transcript.toLowerCase().trim();
  
  // Approval patterns
  const approvalPatterns = [
    /approve\s+(?:payment\s+)?(?:request\s+)?(\w+)/i,
    /approve\s+([0-9]*\.?[0-9]+)\s*([a-zA-Z0-9]+)\s+(?:to\s+)?([a-zA-Z0-9\s]+)(?:\s+on\s+([a-zA-Z0-9\s]+))?/i,
    /yes\s*,?\s*approve/i,
    /confirm\s+(?:payment|request|approval)/i
  ];

  // Rejection patterns
  const rejectionPatterns = [
    /reject\s+(?:payment\s+)?(?:request\s+)?(\w+)(?:\s+because\s+(.+))?/i,
    /deny\s+(?:payment\s+)?(?:request\s+)?(\w+)(?:\s+reason\s+(.+))?/i,
    /no\s*,?\s*(?:reject|deny)/i,
    /cancel\s+(?:payment|request)/i
  ];

  // Request patterns
  const requestPatterns = [
    /request\s+(?:payment\s+(?:of\s+)?)?([0-9]*\.?[0-9]+)\s*([a-zA-Z0-9]+)(?:\s+(?:to|for)\s+([a-zA-Z0-9\s]+))?(?:\s+on\s+([a-zA-Z0-9\s]+))?/i,
    /pay\s+([0-9]*\.?[0-9]+)\s*([a-zA-Z0-9]+)\s+(?:to\s+)?([a-zA-Z0-9\s]+)(?:\s+on\s+([a-zA-Z0-9\s]+))?/i,
    /send\s+([0-9]*\.?[0-9]+)\s*([a-zA-Z0-9]+)\s+(?:to\s+)?([a-zA-Z0-9\s]+)(?:\s+on\s+([a-zA-Z0-9\s]+))?/i
  ];

  // Check/List patterns
  const checkPatterns = [
    /(?:check|show|display)\s+(?:my\s+)?(?:balance|balances)/i,
    /(?:what|show)\s+(?:is\s+)?(?:my\s+)?balance/i,
    /(?:list|show)\s+(?:pending\s+)?(?:payments|requests)/i,
    /(?:what|show)\s+(?:pending\s+)?(?:payments|requests)/i
  ];

  // Help patterns
  const helpPatterns = [
    /help/i,
    /what\s+can\s+(?:i|you)\s+do/i,
    /(?:available\s+)?commands/i,
    /how\s+(?:do\s+i|to)/i
  ];

  // Try approval patterns
  for (const pattern of approvalPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      if (match[1] && match[2]) {
        // Full approval with amount
        return {
          action: 'approve',
          amount: match[1],
          token: match[2],
          recipient: match[3]?.trim(),
          chain: match[4]?.trim()
        };
      } else {
        // Simple approval with request ID
        return {
          action: 'approve',
          requestId: match[1] || 'current'
        };
      }
    }
  }

  // Try rejection patterns
  for (const pattern of rejectionPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      return {
        action: 'reject',
        requestId: match[1] || 'current',
        reason: match[2]?.trim()
      };
    }
  }

  // Try request patterns
  for (const pattern of requestPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      return {
        action: 'request',
        amount: match[1],
        token: match[2],
        recipient: match[3]?.trim(),
        chain: match[4]?.trim()
      };
    }
  }

  // Try check patterns
  for (const pattern of checkPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      if (lower.includes('balance')) {
        return { action: 'check' };
      } else {
        return { action: 'list' };
      }
    }
  }

  // Try help patterns
  for (const pattern of helpPatterns) {
    const match = pattern.exec(lower);
    if (match) {
      return { action: 'help' };
    }
  }

  return null;
}

// Legacy function for backwards compatibility
export function parseApprovalCommand(transcript: string) {
  const command = parseVoiceCommand(transcript);
  if (command?.action === 'approve') {
    return {
      amount: command.amount || '',
      token: command.token || '',
      recipient: command.recipient || '',
      chain: command.chain || ''
    };
  }
  return null;
}

export function getVoiceCommandHelp(): string {
  return `Voice Commands Available:

APPROVALS:
• "Approve payment REQ-001"
• "Approve 100 USDC to Alice"
• "Yes, approve"
• "Confirm payment"

REJECTIONS:
• "Reject payment REQ-001"
• "Deny request because insufficient funds"
• "No, reject"
• "Cancel payment"

REQUESTS:
• "Request payment of 500 USDC"
• "Pay 1 ETH to Bob on Ethereum"
• "Send 100 USDC to Alice on Polygon"

INFORMATION:
• "Check my balance"
• "Show pending requests"
• "List payments"

HELP:
• "Help"
• "What commands are available?"
• "What can I do?"`;
}
