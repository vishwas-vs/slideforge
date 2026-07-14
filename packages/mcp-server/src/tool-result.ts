/**
 * Shared response shape for tool handlers. Business-logic failures (beat
 * not found, invalid reorder, no deck yet) are reported via `isError`
 * rather than thrown, per MCP convention -- the calling agent sees the
 * message as tool output it can react to, not a transport-level error.
 */
export function textResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}
