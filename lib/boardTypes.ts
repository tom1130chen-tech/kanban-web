export type ColumnId = "Scheduled" | "Queue" | "In Progress" | "Done";

export type KanbanCard = {
  id: string;
  owner: string;
  dueDate: string; // YYYY-MM-DD
  description: string;
};

export type BoardState = Record<ColumnId, KanbanCard[]>;

export const COLUMN_ORDER: ColumnId[] = ["Scheduled", "Queue", "In Progress", "Done"];

export function makeEmptyBoard(): BoardState {
  return {
    Scheduled: [],
    Queue: [],
    "In Progress": [],
    Done: [],
  };
}
