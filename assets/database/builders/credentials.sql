CREATE TABLE "client" (
    "name": TEXT NOT NULL UNIQUE,
    "token": TEXT NOT NULL UNIQUE,
    
    "application-id": TEXT NOT NULL UNIQUE,
    "public-key": TEXT NOT NULL UNIQUE,
    "client-id": TEXT NOT NULL UNIQUE,
    "client-secret": TEXT NOT NULL UNIQUE,
    PRIMARY KEY('name', 'token')
)
