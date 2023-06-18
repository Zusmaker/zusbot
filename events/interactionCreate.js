const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`ヽ(#ﾟДﾟ)ﾉ┌┛ ${interaction.commandName} errow!`);
            return;
        }

        try {
            await command.execute(interaction); // +interaction.client
        } catch (error) {
            console.error(`ヽ(#ﾟДﾟ)ﾉ┌┛ ${interaction.commandName} wut?`);
            console.error(error);
        }
    },
};