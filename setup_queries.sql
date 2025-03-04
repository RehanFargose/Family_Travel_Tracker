--  BASIC SETUP --
-- Execute these commands in Postgresql 15 or higher for basic setup --

-- Create a Database named world
CREATE DATABASE world;
-- Right click on the DB name and open query tool and execute the following queries to create the tables --


-- Create a table of all the countries names and their codes, will be used for looking up & finding country codes to add in other db --
CREATE TABLE countries(
    id SERIAL PRIMARY KEY,
    country_code CHAR(2),
    country_name VARCHAR(100)
);
-- After Table is created import the data from the countries.csv file into it  --



-- Create the User's table to store username and their assoicated color on the map --
CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(15) UNIQUE NOT NULL,
color VARCHAR(15)
);

-- Create the Visited Countries table to store country codes for visited countries & reference the Users table via user_id --
CREATE TABLE visited_countries(
id SERIAL PRIMARY KEY,
country_code CHAR(2) NOT NULL,
user_id INTEGER REFERENCES users(id)
);

-- Add 2 users initially to test whether the postgre db/table is storing the info --
INSERT INTO users (name, color)
VALUES ('John', 'teal'), ('Sam', 'powderblue');

INSERT INTO visited_countries (country_code, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2 );

SELECT *
FROM visited_countries
JOIN users
ON users.id = user_id;