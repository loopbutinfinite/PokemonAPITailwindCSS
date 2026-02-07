import { SaveToLocalStorage, RemoveFromLocalStorage, GetFromLocalStorage } from "./localStorage.js";

const pokemonSpriteImg = document.getElementById("pokemonSpriteImg");
const pokemonShinySpriteImg = document.getElementById("pokemonShinySpriteImg");
const pokemonNameText = document.getElementById("pokemonNameText");
const pokemonLocationText = document.getElementById("pokemonLocationText");
const pokemonTypeText = document.getElementById("pokemonTypeText");
const pokemonAbilitiesText = document.getElementById("pokemonAbilitiesText");
const pokemonMovesText = document.getElementById("pokemonMovesText");
const pokemonEvolutionPathText = document.getElementById("pokemonEvolutionPathText");
const pokemonInfoButton = document.getElementById("pokemonInfoButton");
const pokemonInputSearch = document.getElementById("pokemonInputSearch");
const pokemonFirstEvoImg = document.getElementById("pokemonFirstEvoImg");
const pokemonSecondEvoImg = document.getElementById("pokemonSecondEvoImg");
const pokemonThirdEvoImg = document.getElementById("pokemonThirdEvoImg");
const pokemonIDText = document.getElementById("pokemonIDText");
const saveToLocalStorageButton = document.getElementById("saveToLocalStorageButton");
const favoritedPokemon = document.getElementById("favoritedPokemon");
const removeFromLocalStorageButton = document.getElementById("removeFromLocalStorageButton");
const openFavoritesButton = document.getElementById("openFavoritesButton");

const lastGen5Pokemon = 649;

const getEvolutionData = async (userInput) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${userInput.toLowerCase()}`);
    const data = await response.json();

    const responseEvo = await fetch(data.evolution_chain.url);
    const dataEvo = await responseEvo.json();

    const evolutionDetails = [];
    let currentStep = dataEvo.chain;

    while (currentStep) {
        const pokemonName = currentStep.species.name;
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokeData = await pokeRes.json();

        evolutionDetails.push({
            name: pokemonName,
            sprite: pokeData.sprites.front_default
        });
        currentStep = currentStep.evolves_to[0];
    }
    return evolutionDetails;
}

const FetchPokemonFromSearch = async () => {
    let userPokemonSearch = pokemonInputSearch.value;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${userPokemonSearch}/`)
    const data = await response.json()
    if (data.id > lastGen5Pokemon) {
        pokemonNameText.innerHTML = `<p id="pokemonNameText" class="centerTitletext">This is limited to only Gen 1-5 Pokemon. Please try again.</p>`
        return null;
    }
    return data;
};

const DisplayPokemonInformationFromSearch = async (pokeData) => {
    pokemonSpriteImg.src = `${pokeData.sprites.front_default}`
    pokemonShinySpriteImg.src = `${pokeData.sprites.front_shiny}`
    pokemonNameText.textContent = `${pokeData.name.charAt(0).toUpperCase() + pokeData.name.slice(1)}`;
    pokemonIDText.textContent = `#${pokeData.id}`

    const allMoves = pokeData.moves.map(item => item.move.name).join(", ")
    pokemonMovesText.textContent = `${allMoves}`;

    const allAbilities = pokeData.abilities.map(item => item.ability.name).join(", ");
    pokemonAbilitiesText.textContent = `${allAbilities}`

    const allTypes = pokeData.types.map(item => item.type.name).join(", ");
    pokemonTypeText.textContent = `${allTypes}`
};

const DisplayPokemonLocationFromSearch = async (pokemonId) => {
    const pokeLocationSearch = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
    const data = await pokeLocationSearch.json();

    if (data.length > 0) {
        pokemonLocationText.textContent = `${data[0].location_area.name}`;
    }
    else {
        pokemonLocationText.textContent = `N/A. This Pokemon does not have a location.`;
    }
};

pokemonInfoButton.addEventListener("click", async () => {
    let randomPokemonID = Math.floor(Math.random() * 649);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonID}/`);
    const pokeData = await response.json();

    DisplayPokemonInformationFromSearch(pokeData);
    DisplayPokemonLocationFromSearch(pokeData.id);

    const evos = await getEvolutionData(pokeData.name);

    if (evos) {
        if (evos.length <= 1) {
            pokemonEvolutionPathText.textContent = `N/A. This Pokemon does not evolve.`
            pokemonFirstEvoImg.src = "";
            pokemonSecondEvoImg.src = "";
            pokemonThirdEvoImg.src = "";
        } else {
            const pathNames = evos.map(p => p.name.charAt(0).toUpperCase() + p.name.slice(1));
            pokemonEvolutionPathText.textContent = `${pathNames.join(" -> ")}`;

            pokemonFirstEvoImg.src = evos[0]?.sprite || "";
            pokemonSecondEvoImg.src = evos[1]?.sprite || "";
            pokemonThirdEvoImg.src = evos[2]?.sprite || "";
        }
    }
});

pokemonInputSearch.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
        const pokeData = await FetchPokemonFromSearch();

        if (pokeData) {
            DisplayPokemonInformationFromSearch(pokeData);
            DisplayPokemonLocationFromSearch(pokeData.id);

            const evos = await getEvolutionData(pokeData.name);

            if (evos) {
                if (evos.length <= 1) {
                    pokemonEvolutionPathText.textContent = `N/A. This Pokemon does not evolve.`
                    pokemonFirstEvoImg.src = "";
                    pokemonSecondEvoImg.src = "";
                    pokemonThirdEvoImg.src = "";
                }
                else {
                    const pathNames = evos.map(p => p.name.charAt(0).toUpperCase() + p.name.slice(1));
                    pokemonEvolutionPathText.textContent = `${pathNames.join(" -> ")}`;

                    pokemonFirstEvoImg.src = evos[0]?.sprite || "";
                    pokemonSecondEvoImg.src = evos[1]?.sprite || "";
                    pokemonThirdEvoImg.src = evos[2]?.sprite || "";
                }
            }
        } else {
            pokemonSpriteImg.src = "";
            pokemonShinySpriteImg.src = "";
            pokemonFirstEvoImg.src = "";
            pokemonSecondEvoImg.src = "";
            pokemonThirdEvoImg.src = "";
        }
        pokemonInputSearch.value = "";
    }
});

const updateFavoritesUI = () => {
    displayFavoritePokemon();
};

saveToLocalStorageButton.addEventListener("click", () => {
    const currentName = pokemonNameText.textContent.toLowerCase();
    if (!currentName || currentName.includes("limited")) return;

    let favorites = GetFromLocalStorage() || [];
    if (!favorites.includes(currentName)) {
        SaveToLocalStorage(currentName);
        updateFavoritesUI();
    }
});

removeFromLocalStorageButton.addEventListener("click", () => {
    const currentName = pokemonNameText.textContent.toLowerCase();
    if (!currentName) return;

    RemoveFromLocalStorage(currentName);
    updateFavoritesUI();
});

const displayFavoritePokemon = () => {
    let favorites = GetFromLocalStorage() || [];
    favoritedPokemon.innerHTML = "";
    favoritedPokemon.className = "flex flex-col gap-2 mt-4";

    favorites.forEach(pokemonName => {
        const row = document.createElement("div");
        row.className = "flex justify-between text-white items-center p-2";

        const nameSpan = document.createElement("span");
        nameSpan.className = "cursor-pointer font-medium capitalize flex-grow";
        nameSpan.textContent = pokemonName;

        row.appendChild(nameSpan);
        favoritedPokemon.appendChild(row);
    });
};

openFavoritesButton.addEventListener("click", () => {
    displayFavoritePokemon();
});

const loadDragoniteAsShowcasePokemon = async () => {
    const dragoniteId = 149;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${dragoniteId}/`);
    const pokeData = await response.json();

    DisplayPokemonInformationFromSearch(pokeData);
    DisplayPokemonLocationFromSearch(pokeData.id);

    const evos = await getEvolutionData(pokeData.name);
    const pathNames = evos.map(p => p.name.charAt(0).toUpperCase() + p.name.slice(1));
    pokemonEvolutionPathText.textContent = `${pathNames.join(" -> ")}`;

    pokemonFirstEvoImg.src = evos[0]?.sprite || "";
    pokemonSecondEvoImg.src = evos[1]?.sprite || "";
    pokemonThirdEvoImg.src = evos[2]?.sprite || "";

};

loadDragoniteAsShowcasePokemon();