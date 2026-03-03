import { Board } from "@/components/board/Board";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-block border-2 border-dashed border-pencil bg-postit px-3 py-1 shadow-hardSm [border-radius:var(--r-wobbly)] -rotate-[1deg]">
            Team work tracker
          </div>
          <h1 className="mt-3 text-5xl md:text-6xl leading-[0.95] rotate-[0.4deg]">
            Kanban, but human.
          </h1>
          <p className="mt-3 text-xl md:text-2xl max-w-[640px] opacity-90">
            Drag cards. Sync in realtime. Looks like a sketchboard instead of a corporate dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => location.reload()}>
            Refresh
          </Button>
        </div>
      </header>

      <Board />
    </main>
  );
}
