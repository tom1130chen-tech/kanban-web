"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { COLUMN_ORDER, type BoardState, type ColumnId } from "../../lib/boardTypes";
import { Column } from "./Column";
import { AddCardModal } from "./AddCardModal";
import { loadBoardState, saveBoardState, getSeedBoard } from "../../lib/localBoard";

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

type Status = "synced" | "saving" | "error";

export function Board() {
  const [board, setBoard] = useState<BoardState>(getSeedBoard());
  const [status, setStatus] = useState<Status>("synced");
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<ColumnId | null>(null);

  const tiltByIndex = useMemo(() => ["left", "right"] as const, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBoard(loadBoardState());
  }, []);

  function persist(next: BoardState) {
    setBoard(next);
    setStatus("saving");
    try {
      saveBoardState(next);
      setStatus("synced");
      setError(null);
    } catch (err) {
      setStatus("error");
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
    <div className="mt-6">
      {error && (
        <div className="mb-4 border-[3px] border-accent bg-accent/10 p-3 shadow-hardSm [border-radius:var(--r-wobbly-md)]">
          <div className="font-heading text-xl">Sync error</div>
          <div className="text-lg">{error}</div>
        </div>
      )}

      <div className="mb-3 inline-flex items-center gap-2 border-2 border-dashed border-pencil bg-white/70 px-3 py-2 shadow-hardSm [border-radius:var(--r-wobbly)] rotate-[1deg]">
        <span className="text-lg">
          Status: {status === "saving" ? "saving" : status === "error" ? "error" : "synced"}
        </span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMN_ORDER.map((colId, idx) => (
            <Column
              key={colId}
              id={colId}
              title={colId}
              cards={board[colId]}
              tilt={tiltByIndex[idx % 2]}
              onAdd={() => {
                setModalColumn(colId);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </DragDropContext>

      <AddCardModal
        open={modalOpen}
        columnId={modalColumn}
        onClose={() => setModalOpen(false)}
        onCreate={(card) => {
          const col = modalColumn!;
          persist({ ...board, [col]: [card, ...board[col]] });
        }}
      />
    </div>
  );
}
