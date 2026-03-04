"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { ColumnId, KanbanCard as CardType } from "../../lib/boardTypes";
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
  const tiltClass = tilt === "left" ? "-rotate-[0.4deg]" : "rotate-[0.4deg]";
  return (
    <div className={cn("flex flex-col gap-3", tiltClass)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="m-0 text-2xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-9 min-w-9 grid place-items-center border-[3px] border-pencil bg-postit text-base [border-radius:var(--r-wobbly)]">
            {cards.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col gap-3",
              snapshot.isDraggingOver &&
                "p-3 border-[3px] border-dashed border-penblue bg-penblue/5 [border-radius:var(--r-wobbly-md)]",
              "min-h-[300px]"
            )}
          >
            {cards.map((c, i) => (
              <KanbanCard key={c.id} card={c} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
