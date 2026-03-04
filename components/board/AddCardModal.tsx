"use client";

import { useMemo, useState } from "react";
import type { ColumnId, KanbanCard } from "../../lib/boardTypes";
import { uid } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export function AddCardModal({
  open,
  columnId,
  onClose,
  onCreate,
}: {
  open: boolean;
  columnId: ColumnId | null;
  onClose: () => void;
  onCreate: (card: KanbanCard) => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [description, setDescription] = useState("");

  if (!open || !columnId) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-pencil/50 p-4">
      <div className="w-full max-w-lg bg-white border-[3px] border-pencil shadow-hardLg p-4 [border-radius:var(--r-wobbly-md)] -rotate-[0.6deg]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="m-0 text-2xl">Add card</h3>
            <div className="mt-1 text-base opacity-80">Column: {columnId}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 grid place-items-center border-[3px] border-pencil bg-white shadow-hardSm [border-radius:var(--r-wobbly)] hover:bg-muted transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-lg">
            Owner
            <div className="mt-1">
              <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="claw / gem / you" />
            </div>
          </label>

          <label className="block text-lg">
            Due date
            <div className="mt-1">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </label>

          <label className="block text-lg">
            Description
            <div className="mt-1">
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const card: KanbanCard = {
                  id: uid("card"),
                  owner: owner.trim(),
                  dueDate,
                  description: description.trim(),
                };
                onCreate(card);
                setOwner("");
                setDueDate(today);
                setDescription("");
                onClose();
              }}
              disabled={!description.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
