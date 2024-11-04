import { Client, GatewayIntentBits, Partials } from 'discord.js';
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { ClientCredentialsContainer, MembersLevelContainer } from '../assets/database/types/container';

// Report for debug only.
// import { generateDependencyReport } from '@discordjs/voice';
// console.info(generateDependencyReport());

// Verify that the database directory aligns with the database builder.
const DBFiles = fs.readdirSync('./assets/database/builders/').filter(v => v.endsWith('.sql'));

for (let DBFile of DBFiles) {
    if (!fs.existsSync(`./assets/database/${DBFile.replace('.sql', '.db')}`)) {
        fs.writeFileSync(`./assets/database/${DBFile.replace('.sql', '.db')}`, '');

        let Container = new sqlite3.Database(`./assets/database/${DBFile.replace('.sql', '.db')}`, err => {
            if (err) return console.error(err);
        });

        let BuildContainer = fs.readFileSync(`./assets/database/builders/${DBFile}`).toString(); // Convert buffer to string

        Container.run(BuildContainer);
        console.info('\x1b[31m%s\x1b[0m', `Please review '${DBFile.replace('.sql', '.db')}' before executing it.`)
    }
}


// Create database method of database file
const CredentialsContainer = new sqlite3.Database('./assets/database/credentials.db', err => {
    if (err) return console.error(err);
});

// Main
CredentialsContainer.get('SELECT * FROM client WHERE "name"="Flan";', async (err, rows: ClientCredentialsContainer) => {
    if (err) return console.error(err);

    const client = new Client({
        intents: [
            // Auto Moderation
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.AutoModerationExecution,
    
            // DirectMessages
            GatewayIntentBits.DirectMessages,
    
            // Guild
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildWebhooks,
    
            // Message Content
            GatewayIntentBits.MessageContent
        ],
        failIfNotExists: true,
        waitGuildTimeout: 30000,

        partials: [
            Partials.Channel,
            Partials.Message
        ]
    });
    
    // Run Events Listening
    const events = fs.readdirSync('./src/events/').filter(v => (v.endsWith('.ts') || v.endsWith('.js')));
    if (events) events.map(async v => (await import(`./events/${v}`)).default(client));

    // Run Handler Executors
    const handlers = fs.readdirSync('./src/handlers/').filter(v => (v.endsWith('.ts') || v.endsWith('.js')));
    if (handlers) handlers.map(async v => (await import(`./handlers/${v}`)).default(client));

    client.login(rows.token).then(
        async () => {

        }
    );
});


CredentialsContainer.close(err => { if (err) console.error(err) });