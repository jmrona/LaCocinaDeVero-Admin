export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('category_id, name')
      .not('name->>es', 'ilike', '%Todo%');

    if (error) {
        console.error('Error fetching categories:', error.message);
        return new Response(
            JSON.stringify({
                message: "Error al obtener las categorías, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
            }),
            { status: 500 }
        );
    }

    return new Response(
      JSON.stringify({
        categories,
      }),
      { status: 200 }
    );
  };