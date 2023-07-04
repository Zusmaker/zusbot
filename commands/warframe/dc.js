const { SlashCommandBuilder, Client } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dc')
        .setDescription('Consulta o log do Dedicated Server (SA/NA+ds+DM/DMRC')
        .addStringOption((option) => 
            option
                .setName('tipo')
                .setDescription('Qual server você gostaria de consultar?')
                .setRequired(true)
                .setChoices(
                    {name: 'SAdsDM', value: 'SAdsDM'},
                    {name: 'NAdsDM', value: 'NAdsDM' },
                    {name: 'SAdsDMRC', value: 'SAdsDMRC' },
                    {name: 'NAdsDMRC', value: 'NAdsDMRC' },
            )
        ),
    async execute(interaction) {
        var serverData = require('./serverData.json');
        const partida = interaction.options.getString('tipo');

        if (serverData.hasOwnProperty(partida)) {
            const totalIn = serverData[partida].totalIn;
            const totalKill = serverData[partida].totalKill;
            
            await interaction.reply({
                content: `\`\`\`Servidor: ${partida}\nTotal de acessos: ${totalIn}\nTotal de mortes: ${totalKill}\`\`\``
            })
        } else {
            interaction.reply({
                content: 'ヽ(#ﾟДﾟ)ﾉ┌┛ Servidor não encontrado',
                ephemeral: true
            });
        };
    },
};