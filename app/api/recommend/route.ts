import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getFallback } from '@/lib/fallbacks';
import { getMatch } from '@/lib/matches';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import type { RecommendRequest, Zone, DelayState } from '@/types';

const ZONES = new Set<Zone>([
  'downtown', 'midtown', 'airport', 'decatur', 'dunwoody',
]);
const DELAY_STATES = new Set<DelayState>(['normal', 'blue_line_delay']);

function fallbackResponse(zone: Zone, delayState: DelayState): Response {
  return new Response(getFallback(zone, delayState), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: Partial<RecommendRequest>;
  try {
    body = await req.json() as Partial<RecommendRequest>;
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const zone = body.zone;
  const matchId = body.match_id;
  const delayState = body.delay_state ?? 'normal';

  if (!zone || !ZONES.has(zone) || !matchId || !DELAY_STATES.has(delayState)) {
    return new Response('Bad request', { status: 400 });
  }

  if (process.env.USE_MOCK_CLAUDE === 'true') {
    return fallbackResponse(zone, delayState);
  }

  const match = getMatch(matchId);
  if (!match) return fallbackResponse(zone, delayState);

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: buildSystemPrompt(),
      messages: [
        { role: 'user', content: buildUserPrompt(zone, match, delayState) },
      ],
      maxOutputTokens: 150,
      abortSignal: AbortSignal.timeout(8000),
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[/api/recommend] Claude failed:', err);
    return fallbackResponse(zone, delayState);
  }
}
