import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="mx-auto flex max-w-3xl items-center justify-center">
        <Card className="w-full border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-4xl font-extrabold tracking-[0.3em] text-amber-400">
              R.E.P.O.
            </CardTitle>
            <p className="text-sm uppercase tracking-widest text-slate-400">
              Retrieval Extraction Protocol Operations
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center text-slate-300">
            <p>
              Loot a procedurally generated facility, haul fragile valuables to the
              extraction point, and meet your quota — without alerting the monsters.
            </p>
            <Link to="/play">
              <Button className="bg-amber-500 px-8 py-6 text-lg font-bold tracking-widest text-slate-950 hover:bg-amber-400">
                PLAY R.E.P.O. ▸
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
