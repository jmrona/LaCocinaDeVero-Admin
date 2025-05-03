import { supabase } from "./supabase";

export const getCategories = async (page: number, perPage: number, sortBy?: string, order?: string, search?: string) => {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const query = supabase
    .from('categories')
    .select(`*`)
    .not('name->>es', 'ilike', '%Todo%');

    if(search) query.ilike(`name->>es`, `%${search}%`)
    
    query.range(from, to)

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dishes:', error.message);
      return [];
    }


    return data
}