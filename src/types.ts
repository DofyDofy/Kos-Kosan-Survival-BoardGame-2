export type TileCategory = 
  | 'START' 
  | 'KOS' 
  | 'HARIAN' 
  | 'REZEKI' 
  | 'PENGELUARAN_TAK_TERDUGA' 
  | 'EVENT_UMUM';

export type CardCategory = 'REZEKI' | 'PENGELUARAN' | 'UNIK';

export type FinancialStatus = 'Aman' | 'Menipis' | 'Kritis' | 'Bangkrut';

export interface TileCoord {
  tile: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

export interface TileDef {
  tile: number;
  type: TileCategory;
  name: string;
  description: string;
}

export interface CardDef {
  id: number;
  file: string;
  title: string;
  category: CardCategory;
  categoryLabel: 'Rezeki' | 'Pengeluaran' | 'Kejadian Unik';
  amount: number; // positive for gain, negative for expense
  image: string;
  isChoice?: boolean; // Card 14: Diajak nongkrong
  choiceExpense?: number;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  markerNumber: number; // 1-5 penanda angka
  tile: number; // 1 to 30
  balance: number;
  hasPaidKos: boolean;
  lapCompleted: boolean;
  isFinished: boolean;
  totalRezeki: number;
  totalPengeluaran: number;
  isTurn: boolean;
}

export interface GameLog {
  id: string;
  timestamp: string;
  playerId: string;
  playerName: string;
  type: 'move' | 'daily' | 'kos' | 'card' | 'finish' | 'system';
  message: string;
  amount?: number;
}
