import { useState, useEffect } from "react";
import axios from "axios";
import YouTube from "react-youtube";
import "./Row.scss";
import { API_KEY } from "./request";



const movieTrailer = require("movie-trailer");

const base_url = 'https://image.tmdb.org/t/p/original';

type Props = {
  title: string,
  fetchUrl: string,
  isLargeRow?: boolean
};

type Movie = {
  id: string,
  name: string,
  title: string,
  original_path: string,
  poster_path: string,
  backdrop_path: string
};

type Options = {
  height: string;
  width: string;
  playerVars: {
    autoplay: 0 | 1 | undefined;
  };
}

export const Row = ({ title, fetchUrl, isLargeRow }: Props): JSX.Element => {

  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string | null>("");


  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(fetchUrl);
      console.log(response.data.results);
      setMovies(response.data.results);
      return response;
    }

    fetchData();
  }, [fetchUrl]);

  const opts: Options = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  const handleClick = async (movie: Movie) => {
    if (trailerUrl) {
      setTrailerUrl("");
    } else {
      let trailerurl = await axios.get(
        `/movie/${movie.id}/videos?api_key=` + API_KEY
      );
      setTrailerUrl(trailerurl.data.results[0]?.key);
    }

    movieTrailer(movie?.name || movie?.title || movie?.original_path || "")
      .then((url: string) => {
        const urlParams = new URLSearchParams(new URL(url).search);
        setTrailerUrl(urlParams.get("v"));
      })
      .catch((error: any) => console.log(error.message));

  };

  return (
    <div className="Row /">
      <h2>{title}</h2>
      <div className="Row-posters">
        {/* ポスターコンテンツ */}
        {movies.map((movie, i) => (
          <img
            key={movie.id}
            className={`Row-poster ${isLargeRow && "Row-poster-larger"}`}
            src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path
              }`}
            alt={movie.name}
            onClick={() => handleClick(movie)}
          />
        ))}
      </div>
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
    </div>
  )
};
