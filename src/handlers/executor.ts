const commadsRelativePath = '../commands';
const commadsAbsolutePath = './src/commands';

import { Client, Collection, REST, Routes,  } from 'discord.js';
import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { ClientCredentialsContainer, MembersLevelContainer } from '../../assets/database/types/container';

// Create database method of database file
const CredentialsContainer = new sqlite3.Database('./assets/database/credentials.db', err => { if (err) return console.error(err); });

const inet_members = (): Promise<MembersLevelContainer['user-id'][]> => {
    return new Promise((resolve, reject) => {
        CredentialsContainer.all('SELECT "user-id" FROM "members-level" WHERE "permission-level"=4;', (err: Error, rows: MembersLevelContainer[]) => {
            if (err) return reject(err);
            
            let UserIdPermission = [] 
            for (let i=0;i<rows.length;i++) {
                UserIdPermission.push(rows[i]['user-id'])
            }
            resolve(UserIdPermission);
        });
    });
};
const inet_member: string[] = await inet_members();

export default async (client: Client) => {

    CredentialsContainer.get('SELECT * FROM client WHERE "name"="Flan"', async (err, rows: ClientCredentialsContainer): Promise<void> => {
        if (err) return console.error(err);
        // for normal user commands
        const CommandsCollector = new Collection();
        const CommandsArray: any[] = [];

        // for inet commands
        const inetCategoryCommands: any[] = [];

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

        // Inet commands for Inet owner (or permission-level is '4')
        // cuz It's can watching local home network via Inet commands...
        let inetFiles = fs.readdirSync(`${commadsAbsolutePath}/inet`).filter(v => (v.endsWith('.ts') || v.endsWith('.js')));
        for (let inetFile of inetFiles) {
            const inet = (await import(`${commadsRelativePath}/inet/${inetFile}`)).default;

            inetCategoryCommands.push(inet.data.toJSON());
            CommandsArray.push(inet.data.toJSON());
            CommandsCollector.set(inet.data.name, inet);
        }
        
        const rest = new REST({ version: '10' }).setToken(client.token ? client.token : rows.token);
        
        try {
            console.log('(FlanProject/REF): Started refreshing application (/) commands.');
            
            await rest.put(Routes.applicationCommands(client.application?.id ? client.application?.id : rows['application-id']), { body: CommandsArray });
            // await rest.put(Routes.applicationCommands(client.application?.id ? client.application?.id : rows['application-id']), { body: inet_CommandArray });

            console.log('(FlanProject/REF): Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }


        // Create an Interaction
        client.on('interactionCreate', async interaction => {
            if (interaction.isChatInputCommand()) {
                // for inet members
                if (!
                    inet_member.includes(interaction.user.id)
                    && inetCategoryCommands.includes(interaction.commandName)
                ) return interaction.reply(
                    {
                        content: `- Sorry, but you don't have permission to use any our inet commands like \`/${interaction.commandName}\`.`,
                        ephemeral: true
                    }
                );

                let command: any = CommandsCollector.get(interaction.commandName);
                command.run(interaction);

                // let inetc: any = inet_CommandCollector.get(interaction.commandName);
                // inetc.run(interaction);
            }
            else if (interaction.isAutocomplete()) {
                let command: any = CommandsCollector.get(interaction.commandName);
                
                command.autoInteraction(client, interaction);
            }
          });
    });

    CredentialsContainer.close(err => { if (err) console.error(err) });
}