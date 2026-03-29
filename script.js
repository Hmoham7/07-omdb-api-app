// OMDb demo API key used for classroom projects.
const API_KEY = "9ac890b8";

// Get elements from the page.
const searchForm = document.getElementById("search-form");
const movieSearchInput = document.getElementById("movie-search");
const movieResults = document.getElementById("movie-results");
const watchlistContainer = document.getElementById("watchlist");
const movieDetailsModal = document.getElementById("movie-details-modal");
const modalBody = document.getElementById("modal-body");
const modalCloseButton = document.getElementById("modal-close-button");

const EMPTY_WATCHLIST_MESSAGE = "Your watchlist is empty. Search for movies to add!";
const WATCHLIST_STORAGE_KEY = "movieWatchlist";

// Store search results and watchlist in memory.
let currentSearchResults = [];
let watchlist = [];

// Save the current watchlist in localStorage.
function saveWatchlist() {
	localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

// Load the watchlist from localStorage when the page starts.
function loadWatchlist() {
	const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);

	if (savedWatchlist === null) {
		watchlist = [];
		return;
	}

	watchlist = JSON.parse(savedWatchlist);
}

// Build one movie card (poster, title, year).
function createMovieCard(movie) {
	const posterSrc = movie.Poster !== "N/A"
		? movie.Poster
		: "https://via.placeholder.com/300x450?text=No+Poster";

	return `
		<article class="movie-card">
			<img class="movie-poster" src="${posterSrc}" alt="${movie.Title} poster">
			<div class="movie-info">
				<h3 class="movie-title">${movie.Title}</h3>
				<p class="movie-year">${movie.Year}</p>
				<div class="movie-actions">
					<button class="btn details-btn" data-imdb-id="${movie.imdbID}">Details</button>
					<button class="btn add-to-watchlist-btn" data-imdb-id="${movie.imdbID}">Add to Watchlist</button>
				</div>
			</div>
		</article>
	`;
}

// Build one watchlist card.
function createWatchlistCard(movie) {
	const posterSrc = movie.Poster !== "N/A"
		? movie.Poster
		: "https://via.placeholder.com/300x450?text=No+Poster";

	return `
		<article class="movie-card">
			<img class="movie-poster" src="${posterSrc}" alt="${movie.Title} poster">
			<div class="movie-info">
				<h3 class="movie-title">${movie.Title}</h3>
				<p class="movie-year">${movie.Year}</p>
				<div class="movie-actions">
					<button class="btn details-btn" data-imdb-id="${movie.imdbID}">Details</button>
					<button class="btn remove-from-watchlist-btn" data-imdb-id="${movie.imdbID}">Remove</button>
				</div>
			</div>
		</article>
	`;
}

// Fetch movies from OMDb by search text.
async function fetchMovies(searchText) {
	const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchText)}`;
	const response = await fetch(url);
	const data = await response.json();
	return data;
}

// Fetch full movie details from OMDb using IMDb ID.
async function fetchMovieDetails(imdbID) {
	const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
	const response = await fetch(url);
	const data = await response.json();
	return data;
}

// Build modal content with full movie information.
function createMovieDetailsContent(movie) {
	const posterSrc = movie.Poster !== "N/A"
		? movie.Poster
		: "https://via.placeholder.com/300x450?text=No+Poster";

	return `
		<div class="modal-details">
			<img class="modal-poster" src="${posterSrc}" alt="${movie.Title} poster">
			<div class="modal-text">
				<h3 id="modal-movie-title">${movie.Title}</h3>
				<p><span class="label">Year:</span> ${movie.Year}</p>
				<p><span class="label">Rating:</span> ${movie.imdbRating}</p>
				<p><span class="label">Genre:</span> ${movie.Genre}</p>
				<p><span class="label">Director:</span> ${movie.Director}</p>
				<p><span class="label">Cast:</span> ${movie.Actors}</p>
				<p><span class="label">Plot:</span> ${movie.Plot}</p>
			</div>
		</div>
	`;
}

// Open the modal and load details for one movie.
async function openMovieDetailsModal(imdbID) {
	modalBody.innerHTML = "<p>Loading movie details...</p>";
	movieDetailsModal.classList.remove("hidden");
	movieDetailsModal.setAttribute("aria-hidden", "false");

	const data = await fetchMovieDetails(imdbID);

	if (data.Response === "True") {
		modalBody.innerHTML = createMovieDetailsContent(data);
	} else {
		modalBody.innerHTML = "<p>Movie details could not be loaded.</p>";
	}
}

// Close the details modal.
function closeMovieDetailsModal() {
	movieDetailsModal.classList.add("hidden");
	movieDetailsModal.setAttribute("aria-hidden", "true");
}

// Show movies in the results grid.
function renderMovies(movies) {
	currentSearchResults = movies;
	const movieCards = movies.map((movie) => createMovieCard(movie)).join("");
	movieResults.innerHTML = movieCards;
}

// Show all movies currently in the watchlist.
function renderWatchlist() {
	if (watchlist.length === 0) {
		watchlistContainer.textContent = EMPTY_WATCHLIST_MESSAGE;
		return;
	}

	const watchlistCards = watchlist.map((movie) => createWatchlistCard(movie)).join("");
	watchlistContainer.innerHTML = watchlistCards;
}

// Add a movie to the watchlist if it is not already there.
function addToWatchlist(imdbID) {
	const selectedMovie = currentSearchResults.find((movie) => movie.imdbID === imdbID);

	if (!selectedMovie) {
		return;
	}

	const alreadyInWatchlist = watchlist.some((movie) => movie.imdbID === imdbID);

	if (alreadyInWatchlist) {
		return;
	}

	watchlist.push(selectedMovie);
	saveWatchlist();
	renderWatchlist();
}

// Show a message when there are no results.
function renderNoResults(message) {
	movieResults.innerHTML = `<p class="no-results">${message}</p>`;
}

// Listen for clicks on Add to Watchlist buttons inside search results.
movieResults.addEventListener("click", (event) => {
	const detailsButton = event.target.closest(".details-btn");

	if (detailsButton) {
		openMovieDetailsModal(detailsButton.dataset.imdbId);
		return;
	}

	const addButton = event.target.closest(".add-to-watchlist-btn");

	if (!addButton) {
		return;
	}

	addToWatchlist(addButton.dataset.imdbId);
});

// Handle the search form submission.
searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const searchText = movieSearchInput.value.trim();

	if (searchText === "") {
		renderNoResults("Type a movie name to start searching.");
		return;
	}

	renderNoResults("Searching movies...");

	const data = await fetchMovies(searchText);

	if (data.Response === "True") {
		renderMovies(data.Search);
	} else {
		renderNoResults("No movies found. Try another search.");
	}
});


// Remove a movie from the watchlist by IMDb ID.
function removeFromWatchlist(imdbID) {
	watchlist = watchlist.filter((movie) => movie.imdbID !== imdbID);
	saveWatchlist();
	renderWatchlist();
}

// Listen for clicks on Remove buttons inside the watchlist.
watchlistContainer.addEventListener("click", (event) => {
	const detailsButton = event.target.closest(".details-btn");

	if (detailsButton) {
		openMovieDetailsModal(detailsButton.dataset.imdbId);
		return;
	}

	const removeButton = event.target.closest(".remove-from-watchlist-btn");

	if (!removeButton) {
		return;
	}

	removeFromWatchlist(removeButton.dataset.imdbId);
});

modalCloseButton.addEventListener("click", () => {
	closeMovieDetailsModal();
});

movieDetailsModal.addEventListener("click", (event) => {
	const closeTarget = event.target.closest("[data-close-modal]");

	if (!closeTarget) {
		return;
	}

	closeMovieDetailsModal();
});


// Initialize the watchlist UI with saved data.
loadWatchlist();
renderWatchlist();
