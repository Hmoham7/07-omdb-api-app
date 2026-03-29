// OMDb demo API key used for classroom projects.
const API_KEY = "9ac890b8";

// Get elements from the page.
const searchForm = document.getElementById("search-form");
const movieSearchInput = document.getElementById("movie-search");
const movieResults = document.getElementById("movie-results");

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

// Show movies in the results grid.
function renderMovies(movies) {
	const movieCards = movies.map((movie) => createMovieCard(movie)).join("");
	movieResults.innerHTML = movieCards;
}

// Show a message when there are no results.
function renderNoResults(message) {
	movieResults.innerHTML = `<p class="no-results">${message}</p>`;
}

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
