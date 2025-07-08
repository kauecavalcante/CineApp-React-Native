const API_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500'; 
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; 


const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;


if (!API_KEY) {
  throw new Error("A chave da API do TMDB não foi encontrada. Verifique seu arquivo .env");
}

/**
 * Constrói a URL completa para uma requisição à API do TMDB.
 * @param endpoint O endpoint da API (ex: /movie/popular).
 * @param params Parâmetros adicionais para a URL.
 * @returns A URL completa.
 */
const buildUrl = (endpoint: string, params: string = '') => {
  return `${API_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR&region=BR${params}`;
};

export async function getTrendingWeeklyMovies() {
  const response = await fetch(buildUrl('/trending/movie/week'));
  return (await response.json()).results;
}

export async function getPopularMovies() {
  const response = await fetch(buildUrl('/movie/popular'));
  return (await response.json()).results;
}

export async function getNowPlayingMovies() {
  const response = await fetch(buildUrl('/movie/now_playing'));
  return (await response.json()).results;
}

export async function getUpcomingMovies() {
  const response = await fetch(buildUrl('/movie/upcoming'));
  return (await response.json()).results;
}

export async function getTopRatedMovies() {
  const response = await fetch(buildUrl('/movie/top_rated'));
  return (await response.json()).results;
}

export async function getMovieDetails(movieId: number) {
  const appendToResponse = '&append_to_response=release_dates,credits,watch/providers,videos';
  const response = await fetch(buildUrl(`/movie/${movieId}`, appendToResponse));
  return await response.json();
}

/**
 * Retorna a URL completa para um pôster de filme.
 * @param path O caminho do arquivo do pôster.
 * @returns A URL completa da imagem ou uma URL de placeholder.
 */
export function getImageUrl(path: string) {
  if (!path) return 'https://placehold.co/500x750/2C2C2C/FFBB38?text=Sem+Imagem';
  return `${POSTER_BASE_URL}${path}`;
}

/**
 * Retorna a URL completa para uma imagem de backdrop.
 * @param path O caminho do arquivo do backdrop.
 * @returns A URL completa da imagem ou uma URL de placeholder.
 */
export function getBackdropUrl(path: string) {
    if (!path) return 'https://placehold.co/1280x720/2C2C2C/FFBB38?text=Sem+Imagem';
    return `${BACKDROP_BASE_URL}${path}`;
}

export async function getMoviesByGenre(genreId: number, page: number = 1, certifications: string[] = []) {
  let params = `&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreId}&watch_region=BR&with_watch_monetization_types=flatrate`;

  if (certifications.length > 0) {
    const certString = certifications.join('|');
    params += `&certification_country=BR&certification=${certString}`;
  }
  
  const response = await fetch(buildUrl('/discover/movie', params));
  
  if (!response.ok) {
    console.error("Falha ao buscar filmes por gênero:", await response.text());
    throw new Error('Failed to fetch movies by genre');
  }
  return response.json();
}

/**
 * Busca filmes por um termo de pesquisa (query).
 * @param query O texto a ser pesquisado.
 * @param page O número da página.
 * @returns Um objeto com os resultados da busca e informações de paginação.
 */
export async function searchMovies(query: string, page: number = 1) {
  const params = `&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const response = await fetch(buildUrl('/search/movie', params));
  
  if (!response.ok) {
    console.error("Falha ao buscar filmes:", await response.text());
    throw new Error('Failed to search movies');
  }
  return response.json();
}