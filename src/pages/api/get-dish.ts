export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const dishIdParam = url.searchParams.get('dishId');

  if (dishIdParam === null) { // Verificar si el parámetro existe
    return new Response(
      JSON.stringify({ message: "El parámetro 'dishId' es obligatorio" }),
      { status: 400 }
    );
  }
  
  const dishId = parseInt(dishIdParam, 10);
  
  if(dishId === undefined) {
    return new Response(
      JSON.stringify({
        message: "El ID del plato es obligatorio",
      }),
      { status: 400 }
    );
  }
  
  const { data: dish, error } = await supabase
  .from('dishes')
  .select(`
        dish_id,
        name,
        price,
        image,
        dishes_categories!inner(
          categories!inner(
            name, category_id
          )
        ),
        categories:dishes_categories( category_id ),
        allergens:dishes_allergens( allergen_id )
    `)
    .eq('dish_id', dishId)
    .single();
    
    if (error) {
      console.error('Error fetching dish:', error.message);
      return new Response(
        JSON.stringify({
          message: "Error al obtener el plato, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        dish
      }),
      { status: 200 }
    );
  };