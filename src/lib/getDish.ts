export const prerender = false;

export const getDish = async (dishId: number) => {
    const response = await fetch("/api/get-dish", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.json();
}