const commadsRelativePath = '../commands';
const commadsAbsolutePath = './src/commands';

import { Client, Collection, REST, Routes,  } from 'discord.js';
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { ClientCredentialsContainer } from '../../assets/database/types/container';

// Create database method of database file
const CredentialsContainer = new sqlite3.Database('./assets/database/credentials.db', err => { if (err) return console.error(err); });

export default async (client: Client) => {

    CredentialsContainer.get('SELECT * FROM client', async (err, rows: ClientCredentialsContainer): Promise<void> => {
        if (err) return console.error(err);
        // for normal user commands
        const CommandsCollector = new Collection();
        const CommandsArray: any[] = [];

        // get slash command files
        // User commands for common users or any users on discord...
        let commonFiles = fs.readdirSync(commadsAbsolutePath).filter(v => (v.endsWith('.ts') || v.endsWith('.js')));
        for (let commonFile of commonFiles) {
            const common = (await import(`${commadsRelativePath}/${commonFile}`)).default;
            
            CommandsArray.push(common.data.toJSON());
            CommandsCollector.set(common.data.name, common);
        }

        // Moderator commands for moderators on discord server.
        let moderatorFiles = fs.readdirSync(`${commadsAbsolutePath}/moderator`).filter(v => (v.endsWith('.ts') || v.endsWith('.js')));
        for (let moderatorFile of moderatorFiles) {
            const moderator = (await import(`${commadsRelativePath}/moderator/${moderatorFile}`)).default;

            CommandsArray.push(moderator.data.toJSON());
            CommandsCollector.set(moderator.data.name, moderator);
        }
        
        const rest = new REST({ version: '10' }).setToken(client.token ? client.token : rows.token);
        
        try {
            console.log('Started refreshing application (/) commands.');
            
            await rest.put(Routes.applicationCommands(client.application?.id ? client.application?.id : rows['application-id']), { body: CommandsArray });
            // await rest.put(Routes.applicationCommands(client.application?.id ? client.application?.id : rows['application-id']), { body: inet_CommandArray });

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }


        // Create an Interaction
        client.on('interactionCreate', async interaction => {
            if (interaction.isChatInputCommand()) {
                let command: any = CommandsCollector.get(interaction.commandName);
                command.run(interaction);
            }
            else if (interaction.isAutocomplete()) {
                let command: any = CommandsCollector.get(interaction.commandName);
                
                command.autoInteraction(client, interaction);
            }
          });
    });

    CredentialsContainer.close(err => { if (err) console.error(err) });
}
