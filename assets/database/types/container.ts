export interface ClientCredentialsContainer {
    "name": string
    "application-id": string
    "public-key": string
    "client-id": string
    "client-secret": string
    "token": string
}

// Members Level & Members Level Labels
export interface MembersLevelContainer {
    "username": string
    "user-id": string
    "permission-level": number
}

export interface MembersLLabelContainer {
    "name": string
    "permission-level": number
}

// Others API Credentials Build!
export interface OpenAICredentials {
    "project": string,
    "organization": string,
    "authorization": string
}