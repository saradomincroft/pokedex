document.addEventListener("DOMContentLoaded", initialize); // ensures JS runs after HTML has loaded

// consts to represent the hearts used for the like toggle function and add to favourites
const EMPTY_HEART = '♡';
const FULL_HEART = '♥';

const pokemonCount = 151; // total number of pokemon being fetched through pokiapi
var pokedex = {}; // {1 : {"name" : "bulbasaur", "img" : url, "type" : ["grass", "poison"], "desc" : "...."}}
var likedPokemon = []; // array used to store liked pokemon


// async function because using await
async function initialize() {
    for (let i = 1; i <= pokemonCount; i++) { 
        await getPokemon(i); 
        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("poke-name");
        pokemon.addEventListener("click", updatePokemon); 
        
        let heart = document.createElement("span");
        heart.classList.add("heart");
        heart.dataset.pokemonId = i;
        heart.dataset.liked = pokedex[i].liked ? "true" : "false";
        heart.innerText = pokedex[i].liked ? FULL_HEART : EMPTY_HEART;
        heart.addEventListener("click", toggleLike); 
        pokemon.appendChild(heart);
        
        // Append the created pokemon div to the list
        document.getElementById("poke-list").appendChild(pokemon);

        if (i === 1) {
            document.getElementById("poke-description").innerText = pokedex[1]["desc"];   
            document.getElementById("poke-img").src = pokedex[1]["img"];
            // document.getElementById("poke-types").innerText = pokedex[1]["types"];
        }
    }
}


// async function because using await
// fetches detailed info about each pokemon from pokeapi
async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();

    let res = await fetch(url);
    let pokemon = await res.json();
    // console.log(pokemon)

    let pokemonName = pokemon["name"]
    let pokemonType = pokemon["types"]
    let pokemonImg = pokemon["sprites"]["front_default"];

    res = await fetch(pokemon["species"]["url"]);
    let pokemonDesc = await res.json();

    // console.log(pokemonDesc);
    pokemonDesc = pokemonDesc["flavor_text_entries"][8]["flavor_text"];
    pokedex[num] = {"name" : pokemonName, "img" : pokemonImg, "types" : pokemonType, "desc" : pokemonDesc}
}

// creates HTML content for pokemon element
function createPokemonElement(num) {
    let pokemon = document.createElement("div");
    pokemon.id = num;
    let types = pokedex[num]["types"].map(typeObj => typeObj["type"]["name"]).join(' ');
    pokemon.innerHTML = `
    <div class="poke-name" data-types="${types}">
        ${num}. ${pokedex[num]["name"].toUpperCase()}
        <span class="heart" data-pokemon-id="${num}" data-liked="${pokedex[num].liked ? 'true' : 'false'}">${pokedex[num].liked ? FULL_HEART : EMPTY_HEART}</span>
    </div>
`;
    document.getElementById("poke-list").append(pokemon);
    pokemon.querySelector(".heart").addEventListener("click", toggleLike);
    pokemon.addEventListener("click", updatePokemon); // this fixes update pokemon issue on search
}

// updates different pokemon when clicked
function updatePokemon() {
    document.getElementById("poke-img").src = pokedex[this.id]["img"];


    // update types
    let types = pokedex[this.id]["types"];
    for (let i=0; i < types.length; i++) {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type");
        type.classList.add(types[i]["type"]["name"]); // adds background and font colour
        typesDiv.append(type);
    }

    // update description
    document.getElementById("poke-description").innerText = pokedex[this.id]["desc"];
}

// function allows you to search for pokemon via name or number, if not found then an alert is shown and text box clears afterwards
// also a getElementById for type-filter search
function searchPokemon() {
    let searchInput = document.getElementById("search-input").value.trim();
    let selectedType = document.getElementById("type-filter").value.toLowerCase();
    let pokeList = document.getElementById("poke-list");
    // pokeList.innerHTML = ""; // Clear existing list
     // Clear only the search results list
     let searchResults = document.querySelectorAll(".poke-name");
     searchResults.forEach(result => result.remove());

    // Search by number
    let pokemonNumber = parseInt(searchInput);
    if (!isNaN(pokemonNumber) && pokemonNumber >= 1 && pokemonNumber <= pokemonCount) {
        createPokemonElement(pokemonNumber);
        return;
    }

    // Search by name
    let name = searchInput.toLowerCase();
    let found = false;

    // Iterate through pokedex to find matching pokemon by name
    Object.keys(pokedex).forEach(id => {
        let pokemonName = pokedex[id]["name"].toLowerCase();
        let pokemonTypes = pokedex[id]["types"].map(type => type["type"]["name"].toLowerCase());
        if (pokemonName.includes(name) && (selectedType === "all" || pokemonTypes.includes(selectedType))) {
            createPokemonElement(parseInt(id));
            found = true;
            
        }
    });

    // If no match, show error message
    if (!found) {
        // check if type has been selected by checking if all not set and show error message saying cant find in this type
        if (selectedType !== "all") {
            document.getElementById("error-message").innerText = `No Pokémon found of type "${selectedType}" with the name or number entered.`;
        } else {
            document.getElementById("error-message").innerText = "No Pokémon found with the name or number entered.";
        }
    } else {
        document.getElementById("error-message").innerText = ""; // Clear error message if text deleted
    }

}


// I don't fully understand how this works but it seems to be working?
// However I would have liked to implement a feature that combines the searches
// eg if you have type selected, and you use the searchbox it only searches through what is filtered
function filterByType() {
    searchPokemon();
    
}

// Function to update the pokemon details when clicked
function updatePokemon() {
    let pokemonId = this.id;
    document.getElementById("poke-img").src = pokedex[pokemonId]["img"];

    let typesDiv = document.getElementById("poke-types");
    typesDiv.innerHTML = ""; // Clear previous types

    let types = pokedex[pokemonId]["types"];
    for (let i = 0; i < types.length; i++) {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type");
        type.classList.add(types[i]["type"]["name"]);
        typesDiv.append(type);
    }

    document.getElementById("poke-description").innerText = pokedex[pokemonId]["desc"];
}

function toggleLike() {
    let pokemonId = this.dataset.pokemonId;
    let isLiked = this.dataset.liked === "true";

    // Toggle liked status
    if (isLiked) {
        this.innerText = EMPTY_HEART;
        this.dataset.liked = 'false';
        this.parentElement.classList.remove('liked'); // Remove the 'liked' class
        this.classList.remove('clicked');
        removeFromFavorites(pokemonId);
        this.classList.remove('red-heart');
    } else {
        this.innerText = FULL_HEART;
        this.dataset.liked = 'true';
        this.parentElement.classList.add('liked'); // Add the 'liked' class
        this.classList.add('clicked');
        addToFavorites(pokemonId);
        this.classList.add('red-heart');
    }

    // Update liked status in the main Pokemon list
    let mainPokemon = document.getElementById(pokemonId);
    if (mainPokemon) {
        mainPokemon.querySelector('.heart').innerText = isLiked ? EMPTY_HEART : FULL_HEART;
        mainPokemon.querySelector('.heart').dataset.liked = isLiked ? 'false' : 'true';
        mainPokemon.querySelector('.heart').classList.toggle('red-heart', !isLiked);
    }
}

// Function add to favourites
function addToFavorites(pokemonId) {
    // checks if pokemonId is already in likedPokemon array or not
    // include method to make sure that duplicate pokemon not added
    if (!likedPokemon.includes(pokemonId)) {
        //if not in favourites
        likedPokemon.push(pokemonId); // pushes pokemonId into likedPokemon array
        pokedex[pokemonId].liked = true; // Update liked status in pokedex (for heart container) toggleLike function
        console.log(`Added ${pokemonId} to favorites`); // check console pokemon added
        updateFavorites(); // calls updateFavourites function to update HTML showing the Pokemon favourites
    }
}

// Function remove from favorites
function removeFromFavorites(pokemonId) {
    let index = likedPokemon.indexOf(pokemonId);
    if (index !== -1) {
        likedPokemon.splice(index, 1);
        // Update the liked status in the pokedex object
        pokedex[pokemonId].liked = false; // Set liked status to false
        updateFavorites();  // calls updateFavourites function to update HTML showing the Pokemon favourites
    }
}

// Update favourites
// This is for updating the HTML list
function updateFavorites() {
    let favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // initialised as an empty list
    // iterating through each pokemon id in likedPokemon array
    likedPokemon.forEach(pokemonId => {
        let pokemon = pokedex[pokemonId];
        // creates div
        let pokemonDiv = document.createElement("div");
        pokemonDiv.classList.add("poke-name");
        // only shows pokemon number, name and appended heart icon
        // attached heart and red-heart class same as full list
        pokemonDiv.dataset.pokemonId = pokemonId;
        pokemonDiv.innerHTML = `
            <span class="pokemon-number">${pokemonId}</span>
            <span class="pokemon-name">${pokemon.name.toUpperCase()}</span>
            <span class="heart red-heart" data-pokemon-id="${pokemonId}" data-liked="${pokemon.liked ? 'true' : 'false'}">${pokemon.liked ? FULL_HEART : EMPTY_HEART}</span>
        `;
        // appends newly created div to favourites list
        favoritesList.appendChild(pokemonDiv);
        // Add event listener to toggleLike function when clicking on the heart icon
        pokemonDiv.querySelector('.heart').addEventListener('click', toggleLike);

        // Update liked status in the pokedex object
        pokedex[pokemonId].liked = true;
    });
}



