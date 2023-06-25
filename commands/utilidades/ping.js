const { SlashCommandBuilder } = require('discord.js');
const { time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde ao ping'),
    async execute(interaction){
        var date = new Date();
        var timeString = time(date);
        var relative = time(date, 'R');
        await interaction.reply(` Pong ${timeString} - ${relative}`);
    },
};
