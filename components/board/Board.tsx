"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { ensureAnonAuth } from "../../lib/auth";
import { COLUMN_ORDER, makeEmptyBoard, type BoardState, type ColumnId } from "../../lib/boardTypes";
import { subscribeBoard, writeBoard } from "../../lib/boardStore";
import { Column } from "./Column";
import { AddCardModal } from "./AddCardModal";

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function Board() {
  const [board, setBoard] = useState<BoardState>(makeEmptyBoard());
  const [status, setStatus] = useState<"connecting" | "synced" | "saving" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<ColumnId | null>(null);

  const tiltByIndex = useMemo(() => ["left", "right"] as const, []);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        await ensureAnonAuth();
        unsub = subscribeBoard(
          (state) => {
            setBoard(state);
            setStatus("synced");
            setError(null);
          },
          (e) => {
            setStatus("error");
            setError(e instanceof Error ? e.message : "Failed to subscribe.");
          }
        );
        setStatus("synced");
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Auth/init failed.");
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  async function persist(next: BoardState) {
    setBoard(next);
    setStatus("saving");
    try {
      await ensureAnonAuth();
      await writeBoard(next);
      setStatus("synced");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Write failed.");
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    const src = source.droppableId as ColumnId;
    const dst = destination.droppableId as ColumnId;

    if (src === dst) {
      const nextCol = reorder(board[src], source.index, destination.index);
      void persist({ ...board, [src]: nextCol });
      return;
    }

    const srcItems = Array.from(board[src]);
    const dstItems = Array.from(board[dst]);
    const [moved] = srcItems.splice(source.index, 1);
    dstItems.splice(destination.index, 0, moved);

    void persist({ ...board, [src]: srcItems, [dst]: dstItems });
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
          Status:{" "}
          {status === "connecting"
            ? "connecting"
            : status === "saving"
            ? "saving"
            : status === "synced"
            ? "synced"
            : "error"}
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
          void persist({ ...board, [col]: [card, ...board[col]] });
        }}
      />
    </div>
  );
}
