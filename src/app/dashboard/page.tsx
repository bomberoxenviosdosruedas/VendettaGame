import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserProperty } from "@/lib/services/game.service";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const propertyId = await getUserProperty(user.id);

  if (propertyId) {
    redirect("/dashboard/overview");
  } else {
    redirect("/onboarding");
  }
}
