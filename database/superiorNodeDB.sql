CREATE TABLE vote_results (
    candidate VARCHAR(255) PRIMARY KEY,
    votes INTEGER DEFAULT 0
);

-- Drop table if exists vote_results;