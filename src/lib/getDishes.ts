import { supabase } from "./supabase";

export const getDishes = async (page: number, perPage: number) => {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error } = await supabase
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
      `).order("name->>es", {ascending: true}).range(from, to)

    if (error) {
      console.error('Error fetching dishes:', error.message);
      return [];
    }

    return data.map(dish => {
        const categories = dish.categories.map(cat => cat.category_id)
        const allergens = dish.allergens.map(allergen => allergen.allergen_id)

        return {
            id: dish.dish_id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            categories,
            allergens
        }
    });

}