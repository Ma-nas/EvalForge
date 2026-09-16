import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Claim {
  claim: string;
  is_supported: boolean;
  confidence: number;
  evidence?: string | null;
}

interface AnnotatedOutputProps {
  outputText: string;
  claims: Claim[];
}

/**
 * AnnotatedOutput — Renders LLM output text with inline color-coded claim highlighting.
 * Supported claims get green highlights, unsupported claims get red highlights.
 * Each highlighted section is hoverable to show confidence and evidence.
 */
export default function AnnotatedOutput({ outputText, claims }: AnnotatedOutputProps) {
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  // Build annotated segments by matching claims to output text
  const segments = buildAnnotatedSegments(outputText, claims);

  return (
    <div className="space-y-4">
      {/* Annotated Text */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-medium text-text-secondary mb-3">Annotated Output</h4>
        <div className="text-sm text-text-primary leading-relaxed">
          {segments.map((segment, i) => {
            if (segment.type === 'plain') {
              return <span key={i}>{segment.text}</span>;
            }
            const claim = segment.claim!;
            return (
              <span
                key={i}
                className={`annotated-claim cursor-pointer rounded px-0.5 transition-all ${
                  claim.is_supported
                    ? 'bg-accent-emerald/15 border-b-2 border-accent-emerald/40 hover:bg-accent-emerald/25'
                    : 'bg-accent-rose/15 border-b-2 border-accent-rose/40 hover:bg-accent-rose/25'
                }`}
                title={`${claim.is_supported ? '✅ Supported' : '❌ Unsupported'} — Confidence: ${(claim.confidence * 100).toFixed(1)}%`}
                onClick={() => setExpandedClaim(expandedClaim === i ? null : i)}
              >
                {segment.text}
                {expandedClaim === i && (
                  <span className={`block text-xs mt-1 px-2 py-1.5 rounded-lg ${
                    claim.is_supported ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-rose/10 text-accent-rose'
                  }`}>
                    {claim.is_supported ? '✅' : '❌'} Confidence: {(claim.confidence * 100).toFixed(1)}%
                    {claim.evidence && (
                      <span className="block text-text-secondary mt-1 italic">
                        Evidence: {claim.evidence.slice(0, 150)}...
                      </span>
                    )}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Claim Detail List */}
      <div className="glass-card p-5 space-y-2">
        <h4 className="text-sm font-medium text-text-secondary mb-3">
          Claim Details ({claims.length} claims)
        </h4>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {claims.map((claim, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all ${
                claim.is_supported
                  ? 'bg-accent-emerald/5 border-accent-emerald/20'
                  : 'bg-accent-rose/5 border-accent-rose/20'
              }`}
            >
              <button
                className="w-full flex items-start gap-2 p-4 text-left"
                onClick={() => setExpandedClaim(expandedClaim === 1000 + i ? null : 1000 + i)}
              >
                {claim.is_supported
                  ? <CheckCircle className="w-4 h-4 text-accent-emerald mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 text-accent-rose mt-0.5 shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{claim.claim}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Confidence: {(claim.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                {expandedClaim === 1000 + i
                  ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                }
              </button>
              {expandedClaim === 1000 + i && claim.evidence && (
                <div className="px-4 pb-4 pt-0">
                  <div className="text-xs text-text-secondary bg-white/5 rounded-lg p-3 italic">
                    <span className="font-medium not-italic text-text-muted">Supporting evidence: </span>
                    {claim.evidence}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── Helpers ────────────────────────────────────────
interface Segment {
  type: 'plain' | 'claim';
  text: string;
  claim?: Claim;
}

function buildAnnotatedSegments(text: string, claims: Claim[]): Segment[] {
  if (!claims.length) return [{ type: 'plain', text }];

  const segments: Segment[] = [];
  let remainingText = text;

  // Sort claims by their position in the text (first match first)
  const sortedClaims = [...claims].sort((a, b) => {
    const posA = text.toLowerCase().indexOf(a.claim.toLowerCase().slice(0, 30));
    const posB = text.toLowerCase().indexOf(b.claim.toLowerCase().slice(0, 30));
    return posA - posB;
  });

  for (const claim of sortedClaims) {
    // Try to find the claim text within the remaining text
    const claimSnippet = claim.claim.slice(0, 50).toLowerCase();
    const idx = remainingText.toLowerCase().indexOf(claimSnippet);

    if (idx >= 0) {
      // Add plain text before the match
      if (idx > 0) {
        segments.push({ type: 'plain', text: remainingText.slice(0, idx) });
      }
      // Find the end of the sentence containing this claim
      const sentenceEnd = findSentenceEnd(remainingText, idx);
      segments.push({
        type: 'claim',
        text: remainingText.slice(idx, sentenceEnd),
        claim,
      });
      remainingText = remainingText.slice(sentenceEnd);
    }
  }

  // Add any remaining text
  if (remainingText) {
    segments.push({ type: 'plain', text: remainingText });
  }

  return segments.length ? segments : [{ type: 'plain', text }];
}

function findSentenceEnd(text: string, startIdx: number): number {
  const afterStart = text.slice(startIdx);
  const match = afterStart.match(/[.!?]\s/);
  if (match && match.index !== undefined) {
    return startIdx + match.index + 1;
  }
  return Math.min(startIdx + 200, text.length);
}
