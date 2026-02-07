const SaveToLocalStorage = (pokemonName) => {
    let favorites = GetFromLocalStorage();
    if (!favorites.includes(pokemonName)) {
        favorites.push(pokemonName);
        localStorage.setItem("pokemonFavorites", JSON.stringify(favorites));
    }
};

const GetFromLocalStorage = () => {
    let data = localStorage.getItem("pokemonFavorites");
    if(!data) return [];
    return JSON.parse(data);
};

const RemoveFromLocalStorage = (pokemonName) => {
    let favorites = GetFromLocalStorage();
    favorites = favorites.filter(fav => fav !== pokemonName);
    localStorage.setItem("pokemonFavorites", JSON.stringify(favorites));
};

export {SaveToLocalStorage, GetFromLocalStorage, RemoveFromLocalStorage}