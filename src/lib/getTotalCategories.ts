import { supabase } from "./supabase";

export const getTotalCategories = async () => {
    const { data, error } = await supabase
    .from('categories')
    .select('*')
    .not('name->>es', 'ilike', '%Todo%');

    if (error) {
      console.error('Error fetching total categories:', error.message);
      return [];
    }

    return data.length;
}