import type { Zone, DelayState } from '@/types';
import type { Match } from '@/types';

const ZONE_DESCRIPTIONS: Record<Zone, string> = {
  downtown: 'Five Points / Centennial Park area (Blue/Green Line access)',
  midtown: 'Arts Center / Peachtree St area (Red/Gold Line)',
  airport: 'Hartsfield-Jackson Airport / College Park MARTA station (Red/Gold Line)',
  decatur: 'Decatur MARTA station (Blue Line, east of Five Points)',
  dunwoody: 'Dunwoody MARTA station (Red Line, north Atlanta)',
};

const DELAY_CONTEXT: Record<DelayState, string> = {
  normal: 'MARTA status: All lines running normally.',
  blue_line_delay:
    'MARTA status: Blue Line — Moderate congestion, 20+ min delays at Vine City / SEC District. Fans taking the Blue Line to the stadium will experience significant delays.',
};

export function buildSystemPrompt(): string {
  return [
    'You are a local Atlanta friend who knows MARTA very well.',
    'Answer in the voice of a text message to a friend — casual, direct, helpful.',
    'Maximum 3 sentences. No bullet points. No headers.',
    'Never say: "Route A", "minutes saved", "optimal path", "utilize", "I recommend", "please note".',
    'If MARTA is delayed on the relevant line, acknowledge it directly and give a real alternative.',
    'Speak like you live here. Be specific about station names and walking directions when relevant.',
  ].join('\n');
}

export function buildUserPrompt(
  zone: Zone,
  match: Match,
  delayState: DelayState,
): string {
  const kickoffMs = new Date(match.kickoff_utc).getTime();
  const minutesUntil = Math.floor((kickoffMs - Date.now()) / 60_000);
  const hoursUntil = Math.floor(minutesUntil / 60);
  const minsRemaining = minutesUntil % 60;
  const timeStr =
    minutesUntil <= 0
      ? 'the game has started'
      : minutesUntil < 60
        ? `${minutesUntil} minutes until kickoff`
        : `${hoursUntil}h ${minsRemaining}m until kickoff`;

  const teams =
    match.team_a === 'TBD'
      ? `the ${match.stage} match`
      : `${match.team_a} vs ${match.team_b} (${match.stage})`;

  return [
    `Fan is going to ${teams} at Mercedes-Benz Stadium in Atlanta.`,
    `They are starting from: ${ZONE_DESCRIPTIONS[zone]}.`,
    `Kickoff: ${match.kickoff_utc} UTC (${timeStr}).`,
    DELAY_CONTEXT[delayState],
    'How do I get to the game?',
  ].join('\n');
}
