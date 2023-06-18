const { SlashCommandBuilder , Client } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga "n" mensagens anteriores')
        .addIntegerOption((n) => n.setName("qtde")
            .setDescription('Quantas mensagens gostaria de apagar?')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        ),
    async execute(interaction) {

        const qtde = interaction.options.getInteger("qtde");

        await interaction.channel.bulkDelete(qtde, true).then((messages) => {
            interaction.reply({
                embeds: [{
                    description: `ヽ(#ﾟДﾟ)ﾉ┌┛ **${messages.size}** R.I.P.`,
                }]
        }).then(() => {
            setTimeout(() => {
                interaction.deleteReply();
            }, 3000);
        });

        }).catch((err) => {
            interaction.reply({
                content: 'ヽ(#ﾟДﾟ)ﾉ┌┛ Errow',
                ephemeral: true
        });
    });
}};