"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { COLUMN_ORDER, type BoardState, type ColumnId } from "../../lib/boardTypes";
import { Column } from "./Column";
import { loadBoardState, saveBoardState, getSeedBoard } from "../../lib/localBoard";

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export type BoardStatus = "synced" | "saving" | "error";

type BoardProps = {
  onStatusChange?: (status: BoardStatus) => void;
};

const sectionLabels = ["Scheduled", "Queue", "In Progress", "Done"];

export function Board({ onStatusChange }: BoardProps) {
  const [board, setBoard] = useState<BoardState>(getSeedBoard());
  const [status, setStatus] = useState<BoardStatus>("synced");
  const [error, setError] = useState<string | null>(null);

  const tiltByIndex = useMemo(() => ["left", "right"] as const, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBoard(loadBoardState());
    setStatus("synced");
    onStatusChange?.("synced");
  }, [onStatusChange]);

  function updateStatus(next: BoardStatus) {
    setStatus(next);
    onStatusChange?.(next);
  }

  function persist(next: BoardState) {
    setBoard(next);
    updateStatus("saving");
    try {
      saveBoardState(next);
      updateStatus("synced");
      setError(null);
    } catch (err) {
      updateStatus("error");
      setError(err instanceof Error ? err.message : "Failed to persist board state.");
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    const src = source.droppableId as ColumnId;
    const dst = destination.droppableId as ColumnId;

    if (src === dst) {
      const nextCol = reorder(board[src], source.index, destination.index);
      persist({ ...board, [src]: nextCol });
      return;
    }

    const srcItems = Array.from(board[src]);
    const dstItems = Array.from(board[dst]);
    const [moved] = srcItems.splice(source.index, 1);
    dstItems.splice(destination.index, 0, moved);

    persist({ ...board, [src]: srcItems, [dst]: dstItems });
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="border-[3px] border-accent bg-accent/10 p-3 shadow-hardSm [border-radius:var(--r-wobbly-md)]">
          <div className="font-heading text-xl">Sync error</div>
          <div className="text-lg">{error}</div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-shell">
          <div className="board-labels">
            {sectionLabels.map((label) => (
              <span key={label} className="board-label">
                {label}
              </span>
            ))}
          </div>
          <div className="board-divider" aria-hidden />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {COLUMN_ORDER.map((colId, idx) => (
              <Column
                key={colId}
                id={colId}
                title={colId}
                cards={board[colId]}
                tilt={tiltByIndex[idx % 2]}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
