import { supabase } from "./supabase";

export const getTotalDishes = async () => {
    const { data, error } = await supabase
    .from('dishes')
    .select('dish_id')

    if (error) {
      console.error('Error fetching dishes:', error.message);
      return [];
    }

    return data.length;
}