export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

interface Dish {
  name: {
    es: string;
    en: string;
    de: string;
  };
  price: number;
  categories: number[];
  allergens: number[];
  image: string;
}

export const POST: APIRoute = async ({ request }) => {
    const data: Dish = await request.json();
    
    const { name, price, categories, allergens } = data;

    if(name.es === "" || name.en === "" || name.de === "") {
      return new Response(
        JSON.stringify({
          message: "El nombre del plato es obligatorio",
        }),
        { status: 400 }
      );
    }

    if(price === "" || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return new Response(
        JSON.stringify({
          message: "El precio del plato es obligatorio",
        }),
        { status: 400 }
      );
    }

    if(categories.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Debes elegir al menos una categoría",
        }),
        { status: 400 }
      );
    }

    const { data: newDish, error } = await supabase
      .from('dishes')
      .insert({
        name,
        price,
        image: "/img/placeholder-image.webp",
      })
        .select("dish_id")
        .single();

    if (error) {
        console.error('Error storing dish:', error.message);
        return new Response(
            JSON.stringify({
                message: "Error al guardar el plato, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
            }),
            { status: 500 }
        );
    }
    const newDishId = newDish.dish_id;

    const categoryLinks = categories.map(categoryId => ({
        dish_id: newDishId,
        category_id: categoryId,
    }));

    const { error: categoryError } = await supabase
      .from('dishes_categories') // La tabla de unión correcta
      .insert(categoryLinks);

    if (allergens && allergens.length > 0) {
        const allergenLinks = allergens.map(allergenId => ({
          dish_id: newDishId, // El ID del plato
          allergen_id: allergenId, // El ID del alérgeno (asegúrate que la columna se llame así)
        }));

        const { error: allergenError } = await supabase
            .from('dishes_allergens') // La tabla de unión correcta para alérgenos
            .insert(allergenLinks);
    }

    return new Response(
      JSON.stringify({
        success: true,
        dishId: newDishId,
        message: "Success!"
      }),
      { status: 200 }
    );
  };
