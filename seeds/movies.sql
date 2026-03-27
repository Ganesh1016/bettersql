DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS film_actors;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS films;
DROP TABLE IF EXISTS directors;

CREATE TABLE directors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  director_id INTEGER NOT NULL,
  release_year INTEGER NOT NULL,
  genre TEXT NOT NULL,
  FOREIGN KEY (director_id) REFERENCES directors(id)
);

CREATE TABLE actors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL
);

CREATE TABLE film_actors (
  film_id INTEGER NOT NULL,
  actor_id INTEGER NOT NULL,
  PRIMARY KEY (film_id, actor_id),
  FOREIGN KEY (film_id) REFERENCES films(id),
  FOREIGN KEY (actor_id) REFERENCES actors(id)
);

CREATE TABLE ratings (
  id INTEGER PRIMARY KEY,
  film_id INTEGER NOT NULL,
  source TEXT NOT NULL,
  score REAL NOT NULL,
  FOREIGN KEY (film_id) REFERENCES films(id)
);

INSERT INTO directors (id, name, country) VALUES
  (1, 'Chloe Zhao', 'China'),
  (2, 'Denis Villeneuve', 'Canada'),
  (3, 'Greta Gerwig', 'USA');

INSERT INTO films (id, title, director_id, release_year, genre) VALUES
  (1, 'Nomadland', 1, 2020, 'Drama'),
  (2, 'Dune', 2, 2021, 'Sci-Fi'),
  (3, 'Barbie', 3, 2023, 'Comedy');

INSERT INTO actors (id, name, birth_year) VALUES
  (1, 'Frances McDormand', 1957),
  (2, 'Timothee Chalamet', 1995),
  (3, 'Margot Robbie', 1990),
  (4, 'Ryan Gosling', 1980);

INSERT INTO film_actors (film_id, actor_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (3, 4);

INSERT INTO ratings (id, film_id, source, score) VALUES
  (1, 1, 'IMDb', 7.3),
  (2, 2, 'IMDb', 8.0),
  (3, 3, 'IMDb', 6.8),
  (4, 1, 'Critics', 8.8),
  (5, 2, 'Critics', 8.5),
  (6, 3, 'Critics', 7.2);

