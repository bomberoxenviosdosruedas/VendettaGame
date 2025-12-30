import { TotalProduction } from "@/components/dashboard/resources/total-production";
import { BuildingProduction } from "@/components/dashboard/resources/building-production";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  

export default function ResourcesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Edificio:</span>
                <Select defaultValue="34:13:129">
                    <SelectTrigger className="w-[180px] bg-stone-200 border-primary/50 text-black">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="34:13:129">34:13:129</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <TotalProduction />
            <BuildingProduction />
        </div>
    );
}