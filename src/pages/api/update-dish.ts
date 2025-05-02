export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

interface Dish {
    dishId: number;
    name: {
        es: string;
        en: string;
        de: string;
    };
    price: number;
    categories: number[];
    allergens: number[];
}

export const PUT: APIRoute = async ({ request }) => {
    const data: Dish = await request.json();
    
    const { dishId, name, price, categories, allergens } = data;

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
      .update({
        name,
        price,
        image: "/img/placeholder-image.webp",
      })
        .match({ dish_id: dishId })
        .single();

    if (error) {
        console.error('Error updating dish:', error.message);
        return new Response(
            JSON.stringify({
                message: "Error al actualizar el plato, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
            }),
            { status: 500 }
        );
    }

    const categoryLinks = categories.map(categoryId => ({
      dish_id: dishId,
      category_id: categoryId,
    }));

    const { error: deleteCategoryError } = await supabase
      .from('dishes_categories')
      .delete()
      .eq("dish_id", dishId);

    const { error: categoryError } = await supabase
      .from('dishes_categories')
      .insert(categoryLinks);

    if (allergens && allergens.length > 0) {
        const { error: deleteAllergenError } = await supabase
          .from('dishes_allergens')
          .delete()
          .eq("dish_id", dishId);
          
        const allergenLinks = allergens.map(allergenId => ({
          dish_id: dishId,
          allergen_id: allergenId,
        }));

        const { error: allergenError } = await supabase
            .from('dishes_allergens')
            .insert(allergenLinks);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success!"
      }),
      { status: 200 }
    );
  };