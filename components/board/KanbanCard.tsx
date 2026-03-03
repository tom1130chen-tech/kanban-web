"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { KanbanCard as CardType } from "@/lib/boardTypes";
import { cn } from "@/lib/utils";

export function KanbanCard({ card, index }: { card: CardType; index: number }) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-postit border-[3px] border-pencil shadow-hard p-3",
            "[border-radius:var(--r-wobbly-md)]",
            "transition-transform duration-100 hover:rotate-[0.8deg] hover:shadow-hardLg",
            snapshot.isDragging && "rotate-[1.4deg] shadow-hardLg"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-lg font-heading leading-tight">{card.owner || "Unassigned"}</div>
            <div className="text-sm text-penblue border-2 border-pencil bg-white px-2 py-0.5 [border-radius:var(--r-wobbly)] shadow-hardSm">
              {card.dueDate || "—"}
            </div>
          </div>
          <div className="mt-2 text-lg leading-snug">{card.description}</div>
        </div>
      )}
    </Draggable>
  );
}
