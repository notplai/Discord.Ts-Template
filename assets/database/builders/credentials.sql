CREATE TABLE "client" (
    "name": TEXT NOT NULL UNIQUE,
    "token": TEXT NOT NULL UNIQUE,
    
    "application-id": TEXT NOT NULL UNIQUE,
    "public-key": TEXT NOT NULL UNIQUE,
    "client-id": TEXT NOT NULL UNIQUE,
    "client-secret": TEXT NOT NULL UNIQUE,
    PRIMARY KEY('name', 'token')
)

CREATE TABLE "members-level" (
    "name": TEXT NOT NULL UNIQUE,
    "user-id": TEXT NOT NULL UNIQUE,
    "permission-level": INT NOT NULL,
    PRIMARY KEY('name')
)

CREATE TABLE "permission-rlink" (
    "name": TEXT NOT NULL UNIQUE,
    "permission-level" INT NOT NULL UNIQUE,

    PRIMARY KEY('permission-level')
)

CREATE TABLE "OpenAI" (
    "name": TEXT NOT NULL UNIQUE,
    "project": TEXT NOT NULL UNIQUE,
    "organization": TEXT NOT NULL UNIQUE,
    "authorization": TEXT NOT NULL UNIQUE

    PRIMARY KEY('name')
)