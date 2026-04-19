import type { DelayState } from '@/types';
import { getMatches } from '@/lib/matches';
import MapViewClient from '@/components/MapViewClient';
import Sidebar from '@/components/Sidebar';
import DelayBanner from '@/components/DelayBanner';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const injectDelay = params['inject_delay'];
  const delayState: DelayState =
    injectDelay === 'blue_line' ? 'blue_line_delay' : 'normal';

  const matches = getMatches();

  return (
    <main className="relative h-full w-full">
      {delayState === 'blue_line_delay' && <DelayBanner />}
      <MapViewClient />
      <Sidebar matches={matches} delayState={delayState} />
    </main>
  );
}
