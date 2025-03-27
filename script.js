// script.js

let movies = [];

// Fetch movies from TVMaze API
function fetchMovies() {
  fetch('https://api.tvmaze.com/shows')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      movies = data.map(show => ({
        id: show.id,
        title: show.name,
        genre: show.genres[0] || 'Unknown',
        image: show.image?.medium || 'placeholder.jpg',
        summary: show.summary || 'No summary available',
        reviews: []
      }));
      renderMovies(movies);
      populateGenreDropdown();
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

// Render movies to the page
function renderMovies(movies) {
  const movieContainer = document.getElementById('movie-container');
  if (!movieContainer) return;
  movieContainer.innerHTML = '';
  
  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Genre: ${movie.genre}</p>
      <button onclick="viewDetails(${movie.id})">View Details</button>
      <button onclick="addToFavorites(${movie.id})">Add to Favorites</button>
      <button onclick="openReviewModal(${movie.id})">Submit Review</button>
      <div id="reviews-${movie.id}" class="reviews"></div>
    `;
    movieContainer.appendChild(movieCard);
  });
}

// Search and filter movies
function searchMovies() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  const searchValue = searchInput.value.toLowerCase();
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchValue)
  );
  renderMovies(filteredMovies);
}

// Filter movies by genre
function filterByGenre() {
  const genreSelect = document.getElementById('filter-select');
  if (!genreSelect) return;
  const selectedGenre = genreSelect.value;
  if (selectedGenre === 'all') {
    renderMovies(movies);
  } else {
    const filteredMovies = movies.filter(movie => movie.genre.toLowerCase() === selectedGenre.toLowerCase());
    renderMovies(filteredMovies);
  }
}

// Populate genre dropdown
function populateGenreDropdown() {
  const genreSelect = document.getElementById('filter-select');
  if (!genreSelect) return;
  const genres = [...new Set(movies.map(movie => movie.genre))];
  
  genreSelect.innerHTML = '<option value="all">All</option>';
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre.toLowerCase();
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
}

// View movie details
function viewDetails(movieId) {
  const movieDetails = document.getElementById('movie-details');
  const movieInfo = document.getElementById('movie-info');
  
  if (!movieDetails || !movieInfo) {
    console.error("Error: 'movie-details' or 'movie-info' not found in DOM.");
    return;
  }

  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    console.error(`Error: Movie with ID ${movieId} not found.`);
    return;
  }

  movieInfo.innerHTML = `
    <h3>${movie.title}</h3>
    <img src="${movie.image}" alt="${movie.title}">
    <p><strong>Genre:</strong> ${movie.genre}</p>
    <p>${movie.summary}</p>
  `;
  movieDetails.style.display = 'block';

  movieDetails.scrollIntoView({ behavior: 'smooth' });
}

// Add to favorites
function addToFavorites(movieId) {
  const movie = movies.find(m => m.id === movieId);
  if (!movie) return;

  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.find(fav => fav.id === movieId)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  displayFavorites();
}

// Display favorites
function displayFavorites() {
  const favoritesContainer = document.getElementById('favorites-container');
  if (!favoritesContainer) return;
  
  favoritesContainer.innerHTML = '<h2>My Favorites</h2>';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.length === 0) {
    favoritesContainer.innerHTML += '<p>No favorites added yet.</p>';
    return;
  }

  favorites.forEach(movie => {
    const favoriteCard = document.createElement('div');
    favoriteCard.classList.add('movie-card');
    favoriteCard.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <button onclick="removeFromFavorites(${movie.id})">Remove from Favorites</button>
    `;
    favoritesContainer.appendChild(favoriteCard);
  });
}

// Remove from favorites
function removeFromFavorites(movieId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(movie => movie.id !== movieId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
}

// Handle review submission
function openReviewModal(movieId) {
  const review = prompt('Enter your review:');
  if (review) {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      movie.reviews.push(review);
      const reviewsContainer = document.getElementById(`reviews-${movieId}`);
      if (reviewsContainer) {
        reviewsContainer.innerHTML += `<p>${review}</p>`;
      }
      alert('Review submitted!');
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const genreSelect = document.getElementById('filter-select');

  if (searchInput) searchInput.addEventListener('input', searchMovies);
  if (genreSelect) genreSelect.addEventListener('change', filterByGenre);

  fetchMovies();
  displayFavorites();
});
