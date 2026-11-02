import { Player } from '../types';

export type GameSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export async function saveGameResults(sessionId: string, players: Player[]): Promise<void> {
  const response = await fetch('/api/game-results', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      players: players.map((player) => ({
        name: player.name,
        balance: player.balance,
        totalRezeki: player.totalRezeki,
        totalPengeluaran: player.totalPengeluaran,
      })),
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload && typeof payload.error === 'string'
      ? payload.error
      : `HTTP ${response.status}`;
    throw new Error(message);
  }
}
