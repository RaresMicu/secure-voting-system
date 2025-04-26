-- CREATE TABLE secured_storing_box (
--     vote_id VARCHAR(255) PRIMARY KEY,
--     candidate VARCHAR(255) NOT NULL,
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE vote_results (
--     candidate VARCHAR(255) PRIMARY KEY,
--     votes INTEGER DEFAULT 0
-- );

CREATE TABLE polling_station_activation (
    id VARCHAR(255) PRIMARY KEY,
    polling_station_hash VARCHAR(255) NOT NULL
);

-- Drop table if exists secured_storing_box;
-- Drop table if exists vote_results;