export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
    const { data: allergens, error } = await supabase
      .from('allergens')
      .select('allergen_id, name')

    if (error) {
        console.error('Error fetching allergens:', error.message);
        return new Response(
            JSON.stringify({
                message: "Error al obtener los alérgenos, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
            }),
            { status: 500 }
        );
    }

    return new Response(
      JSON.stringify({
        allergens,
      }),
      { status: 200 }
    );
  };