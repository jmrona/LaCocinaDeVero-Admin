import { supabase } from "./supabase";

export const getDishes = async (page: number, perPage: number, sortBy?: string, order?: string, search?: string) => {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    let sortByColumn = "name->>es"

    if(sortBy !== undefined) sortByColumn = sortBy
    if(sortBy === "name") sortByColumn = "name->>es"

    const query = supabase
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
        categoriesV2:dishes_categories( category_id!inner(name, category_id) ),
        allergens:dishes_allergens( allergen_id )
    `)

    if(search) query.ilike(`name->>es`, `%${search}%`)
    
    query.order(sortByColumn, {ascending: order === "asc"}).range(from, to)

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dishes:', error.message);
      return [];
    }

    const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select(`*`)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError.message);
      return [];
    }

    const { data: allergensData, error: allergensError } = await supabase
    .from('allergens')
    .select(`*`)

    if (allergensError) {
      console.error('Error fetching allergens:', allergensError.message);
      return [];
    }

    return data.map(dish => {
        const categories = dish.categories.map(cat => categoriesData?.find(category => category.category_id === cat.category_id).name.es)
        const allergens = dish.allergens.map(all => allergensData?.find(allergen => allergen.allergen_id === all.allergen_id).name.es)

        return {
            id: dish.dish_id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            categories,
            allergens
        }
    })
}