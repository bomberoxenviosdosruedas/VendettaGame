
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Map as MapIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MapControlsProps {
  currentCity: number
  currentDistrict: number
}

export function MapControls({ currentCity, currentDistrict }: MapControlsProps) {
  const router = useRouter()
  // Local state for inputs to allow typing before navigating
  const [cityInput, setCityInput] = useState(currentCity.toString())
  const [districtInput, setDistrictInput] = useState(currentDistrict.toString())

  // Sync state if props change (e.g. external navigation)
  useEffect(() => {
    setCityInput(currentCity.toString())
    setDistrictInput(currentDistrict.toString())
  }, [currentCity, currentDistrict])

  const navigateTo = (city: number | string, district: number | string) => {
    const c = Number(city)
    const d = Number(district)
    if (c > 0 && d > 0) {
      router.push(`/dashboard/map?city=${c}&district=${d}`)
    }
  }

  const handlePrevDistrict = () => {
    if (currentDistrict > 1) {
      navigateTo(currentCity, currentDistrict - 1)
    } else {
      // Logic to go to previous city? Maybe keep it simple for now.
    }
  }

  const handleNextDistrict = () => {
    // Assuming max district 50 or infinite? Requirement says 1-50 in memory, but let's just go +1
    navigateTo(currentCity, currentDistrict + 1)
  }

  const handleGo = () => {
    navigateTo(cityInput, districtInput)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-stone-900/80 p-3 rounded-lg border border-stone-700 w-full max-w-2xl shadow-xl">
      <div className="flex items-center gap-2">
        <label className="text-xs text-amber-500 font-bold uppercase tracking-wider">Ciudad</label>
        <Input
          type="number"
          min={1}
          className="w-20 bg-stone-950 border-stone-700 text-stone-200 h-9"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-amber-500 font-bold uppercase tracking-wider">Barrio</label>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none border-r-0 border-stone-700 hover:bg-stone-800 text-stone-400"
            onClick={handlePrevDistrict}
            disabled={currentDistrict <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={1}
            className="w-20 bg-stone-950 border-stone-700 text-stone-200 h-9 rounded-none text-center focus-visible:ring-0"
            value={districtInput}
            onChange={(e) => setDistrictInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none border-l-0 border-stone-700 hover:bg-stone-800 text-stone-400"
            onClick={handleNextDistrict}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        variant="default"
        size="sm"
        className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
        onClick={handleGo}
      >
        <Search className="h-4 w-4 mr-2" />
        Ir
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="border-stone-600 text-stone-400 hover:bg-stone-800"
        onClick={() => router.push('/dashboard/map')} // Resets to home
      >
        <MapIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
