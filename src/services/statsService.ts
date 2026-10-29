export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

import type { MoveRecord } from '../engine/types';

export interface MatchHistoryItem {
  id: string;
  date: string;
  opponent: string;
  difficulty?: string;
  result: 'win' | 'loss' | 'draw';
  totalMoves: number;
  duration?: number; // in seconds
  playerColor: string;
  moves?: MoveRecord[];
}

const STATS_KEY = 'kaiwen_chess_stats';
const HISTORY_KEY = 'kaiwen_match_history';

const DEFAULT_STATS: PlayerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0
};

export function getPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordGameResult(result: 'win' | 'loss' | 'draw'): PlayerStats {
  const current = getPlayerStats();
  const updated: PlayerStats = { ...current, totalGames: current.totalGames + 1 };

  if (result === 'win') {
    updated.wins += 1;
    updated.currentStreak += 1;
    if (updated.currentStreak > updated.bestStreak) {
      updated.bestStreak = updated.currentStreak;
    }
  } else if (result === 'loss') {
    updated.losses += 1;
    updated.currentStreak = 0;
  } else {
    updated.draws += 1;
    updated.currentStreak = 0;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export function getMatchHistory(): MatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMatchRecord(match: Omit<MatchHistoryItem, 'id' | 'date'>): MatchHistoryItem[] {
  try {
    const current = getMatchHistory();
    const newItem: MatchHistoryItem = {
      ...match,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updated = [newItem, ...current].slice(0, 30); // keep last 30 matches
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearMatchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
