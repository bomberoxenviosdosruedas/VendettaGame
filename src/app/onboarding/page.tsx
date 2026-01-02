import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createInitialProperty } from "@/lib/services/game.service";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Handle form submission
  async function setupBase(formData: FormData) {
    "use server";

    // In the future, this would take coordinates from the form
    // For now, we use the auto-assignment logic
    const result = await createInitialProperty({
        nombre: "Base Principal",
        ciudad: 0, // 0 triggers auto-assignment in RPC if logic permits, or we should change RPC
        barrio: 0,
        edificio: 0
    });

    if (result.success || result.propiedad_id) {
        redirect("/dashboard/overview");
    } else {
        // Handle error (would need client component for proper error feedback)
        console.error("Failed to create base", result.error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Bienvenido a Vendetta</h1>
          <p className="mt-2 text-lg text-gray-400">
            Para comenzar, necesitamos establecer tu primera base de operaciones.
          </p>
        </div>

        <div className="mt-8 space-y-6">
            {/*
              This is a temporary placeholder.
              Ideally this would be a client form allowing coordinate selection
              or showing a map.
            */}
            <form action={setupBase}>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Establecer Base Automáticamente
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
