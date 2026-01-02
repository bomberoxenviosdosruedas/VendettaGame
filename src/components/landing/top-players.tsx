import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getTopPlayers } from "@/lib/actions/public-stats";

export async function TopPlayers() {
  const players = await getTopPlayers(10);

  return (
    <Card className="bg-primary/20 border-primary">
      <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
        <CardTitle className="text-lg text-primary-foreground">Mejores Jugadores</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/20 hover:bg-transparent">
              <TableHead className="text-gray-300 w-[50px]">#</TableHead>
              <TableHead className="text-gray-300">Jugador</TableHead>
              <TableHead className="text-right text-gray-300">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length > 0 ? (
              players.map((player, index) => (
                <TableRow key={index} className="border-b border-primary/10 hover:bg-primary/10">
                  <TableCell className="font-medium text-gray-400">
                    {player.ranking_position || index + 1}
                  </TableCell>
                  <TableCell className="text-white">{player.username}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-mono">
                    {Math.floor(player.total_points || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                  Sin datos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
