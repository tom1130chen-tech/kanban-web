import type { BoardState } from "./boardTypes";
import boardSeed from "../data/board-state.json";

const STORAGE_KEY = "kanban-board-state";

function parseState(raw: string | null): BoardState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BoardState;
  } catch (error) {
    console.error("Failed to parse board state from storage", error);
    return null;
  }
}

export function getSeedBoard(): BoardState {
  return boardSeed as BoardState;
}

export function loadBoardState(): BoardState {
  if (typeof window === "undefined") {
    return getSeedBoard();
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return parseState(stored) ?? getSeedBoard();
}

export function saveBoardState(state: BoardState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save board state", error);
  }
}
