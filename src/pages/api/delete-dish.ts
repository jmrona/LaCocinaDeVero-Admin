export const prerender = false;
import { supabase } from "@/lib/supabase";
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request }) => {
    const data: { dishId: number } = await request.json();
    
    const { dishId } = data;
    
    if(dishId === undefined) {
        return new Response(
            JSON.stringify({
                message: "El ID del plato es obligatorio",
            }),
            { status: 400 }
        );
    }
    
    const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('dish_id', dishId);
    
    if (error) {
        console.error('Error deleting dish:', error.message);
        return new Response(
            JSON.stringify({
                message: "Error al eliminar el plato, Intenta de nuevo y si el problema persiste, contacta con tu cuñado.",
            }),
            { status: 500 }
        );
    }
    
    return new Response(
        JSON.stringify({
            success: true,
            message: "Success!"
        }),
        { status: 200 }
    );
};

