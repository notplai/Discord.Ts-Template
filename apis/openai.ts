import OpenAI from 'openai';
import sqlite3 from 'sqlite3';
import { OpenAICredentials } from '../assets/database/types/container';

const OpenAICredential = new sqlite3.Database('./assets/database/credentials.db', err => {
    if (err) return console.error(err);
});

OpenAICredential.get("SELECT * FROM OpenAI WHERE 'name' = 'DiscordAI';", (row: OpenAICredentials) => {
    const openai = new OpenAI({
        organization: row.organization,
        project: row.project,

        apiKey: `Bearer ${row.authorization}`
    });
})