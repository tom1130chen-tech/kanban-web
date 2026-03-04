"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { ColumnId, KanbanCard as CardType } from "../../lib/boardTypes";
import { Card } from "../ui/Card";
import { KanbanCard } from "./KanbanCard";
import { cn } from "../../lib/utils";

export function Column({
  id,
  title,
  cards,
  tilt,
}: {
  id: ColumnId;
  title: string;
  cards: CardType[];
  tilt: "left" | "right";
}) {
  return (
    <Card decoration="tape" tilt={tilt} className="min-h-[420px] flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-2xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 min-w-9 grid place-items-center border-[3px] border-pencil bg-postit shadow-hardSm text-base [border-radius:var(--r-wobbly)]">
            {cards.length}
          </div>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "mt-4 flex flex-col gap-3 flex-1",
              snapshot.isDraggingOver &&
                "p-3 border-[3px] border-dashed border-penblue bg-penblue/5 [border-radius:var(--r-wobbly-md)]"
            )}
          >
            {cards.length === 0 && (
              <div className="border-2 border-dashed border-pencil p-3 opacity-80 [border-radius:var(--r-wobbly-md)]">
                Empty
              </div>
            )}
            {cards.map((c, i) => (
              <KanbanCard key={c.id} card={c} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
}
