CREATE TABLE voter_status (
    ID INTEGER PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    voted BOOLEAN NOT NULL DEFAULT FALSE,
    location VARCHAR(255) ,
    timestamp TIMESTAMP 
);