import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const players = [
    { rank: 1, name: "kamikaz [M_L]", nationality: "it", points: "2.293.509" },
    { rank: 2, name: "Berluska [M_L]", nationality: "it", points: "1.775.789" },
    { rank: 3, name: "UrbanoXIII [Christus]", nationality: "it", points: "1.730.674" },
    { rank: 4, name: "Vax I Nobis [Christus]", nationality: "it", points: "1.600.297" },
    { rank: 5, name: "Alan@Lilly", nationality: "it", points: "1.443.954" },
    { rank: 6, name: "Mustang", nationality: "it", points: "1.188.233" },
    { rank: 7, name: "SpaceClown [M_L]", nationality: "it", points: "644.273" },
    { rank: 8, name: "BIBIT [M_L]", nationality: "it", points: "538.747" },
    { rank: 9, name: "bingo [BRUT]", nationality: "es", points: "389.870" },
    { rank: 10, name: "ReVerendo [M_L]", nationality: "it", points: "336.053" },
    { rank: 11, name: "Chinois_fou [=DMON=]", nationality: "fr", points: "113.832" },
    { rank: 12, name: "★ReX★ [M_L]", nationality: "it", points: "61.943" },
    { rank: 13, name: "DD_Gangsta", nationality: "fr", points: "53.587" },
    { rank: 14, name: "Canalours [=DMON=]", nationality: "fr", points: "31.168" },
    { rank: 15, name: "John Gotti", nationality: "de", points: "30.478" },
    { rank: 16, name: "JeSuisSuisMagasin", nationality: "fr", points: "29.372" },
    { rank: 17, name: "NOGARA [BRUT]", nationality: "es", points: "26.692" },
    { rank: 18, name: "Symba", nationality: "it", points: "26.209" },
    { rank: 19, name: "Kryoxy", nationality: "gb", points: "24.929" },
    { rank: 20, name: "Macshym", nationality: "fr", points: "23.393" },
];


export function TopPlayers() {
  return (
    <section>
      <Card className="border-primary bg-card text-card-foreground">
        <CardHeader className="bg-primary/80 py-2 px-4">
          <CardTitle className="text-lg text-primary-foreground">Migliori Giocatori</CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-stone-200 text-black">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-300 hover:bg-stone-300">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nacionalidad</TableHead>
                <TableHead className="text-right">Punti Totali</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.rank} className="border-stone-300">
                  <TableCell className="font-medium">{player.rank}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>
                    <Image src={`https://flagcdn.com/${player.nationality}.svg`} width={20} height={15} alt={`${player.nationality} flag`} />
                  </TableCell>
                  <TableCell className="text-right">{player.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
