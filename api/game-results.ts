import { createClient } from '@supabase/supabase-js';

type PlayerResultInput = {
  name: string;
  balance: number;
  totalRezeki: number;
  totalPengeluaran: number;
};

type SaveResultsBody = {
  sessionId: string;
  players: PlayerResultInput[];
};

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-store');
  return Response.json(data, { ...init, headers });
};

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase server environment variables are not configured.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isFiniteInteger = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value);

const validateBody = (body: unknown): body is SaveResultsBody => {
  if (!body || typeof body !== 'object') return false;

  const candidate = body as SaveResultsBody;
  if (typeof candidate.sessionId !== 'string' || !isValidUuid(candidate.sessionId)) return false;
  if (!Array.isArray(candidate.players) || candidate.players.length < 2 || candidate.players.length > 5) return false;

  return candidate.players.every((player) => {
    if (!player || typeof player !== 'object') return false;
    const name = typeof player.name === 'string' ? player.name.trim() : '';

    return (
      name.length >= 1 &&
      name.length <= 30 &&
      isFiniteInteger(player.balance) &&
      isFiniteInteger(player.totalRezeki) &&
      isFiniteInteger(player.totalPengeluaran) &&
      player.totalRezeki >= 0 &&
      player.totalPengeluaran >= 0 &&
      Math.abs(player.balance) <= 100_000_000 &&
      player.totalRezeki <= 100_000_000 &&
      player.totalPengeluaran <= 100_000_000
    );
  });
};

export default {
  async fetch(request: Request) {
    try {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'POST' } });
      }

      const body = await request.json().catch(() => null);
      if (!validateBody(body)) {
        return json({ error: 'Payload hasil permainan tidak valid.' }, { status: 400 });
      }

      const supabase = getSupabaseAdmin();
      const sortedPlayers = [...body.players].sort((a, b) => b.balance - a.balance);
      const rows = sortedPlayers.map((player, index) => ({
        session_id: body.sessionId,
        player_name: player.name.trim(),
        rank: index + 1,
        final_balance: player.balance,
        total_rezeki: player.totalRezeki,
        total_pengeluaran: player.totalPengeluaran,
        player_count: sortedPlayers.length,
      }));

      const { error } = await supabase
        .from('game_results')
        .upsert(rows, { onConflict: 'session_id,rank' });

      if (error) throw error;

      return json({ ok: true, sessionId: body.sessionId }, { status: 201 });
    } catch (error) {
      console.error('[game-results]', error);
      return json({ error: 'Gagal mengakses database permainan.' }, { status: 500 });
    }
  },
};
