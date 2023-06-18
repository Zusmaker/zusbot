const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        var date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' });
        console.log(date + ' ZusBot ativo (✿ O‿‿O)');
    },
};
