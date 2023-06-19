const { SlashCommandBuilder } = require('discord.js');
const { time } = require('discord.js');
const fs = require('node:fs');
const logs = require('./logs.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Inicia o log do server'),
    async execute(interaction) {
        var date = new Date();
        var timeString = time(date);
        var relative = time(date, 'R');
        await interaction.reply(`Log ${timeString} - ${relative}`);
        checkLogs();

        //----------------------------------------------- log
        var { client } = require('../../index.js');
        var logchannel = client.channels.cache.get(logs.log_server);
        var maps = require('./maps.json');
        var kills = require('./kills.json');
        var currentMap = '';

        function checkLogs() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Logs: ON');
            fs.open(logs.fileDS00, 'r', function (err, fd) {
                fs.watchFile(logs.fileDS00, function (cstat, pstat) {
                    var delta = cstat.size - pstat.size;
                    if (delta <= 0) return;
                    fs.read(fd, new Buffer.alloc(delta), 0, delta, pstat.size, function (err, bytes, buffer) {
                        bwrite = buffer.toString().replace(/(\r\n|\r|\n)/g, '\n').split('\n');
                        lastline = bwrite.pop();
                        write = '' + lastline;
                        write += bwrite.join('\n');

                        var sortedLines = write.split('\n').sort(function (line1, line2) {
                            var num1 = parseFloat(line1.match(/^\d+\.\d+/));
                            var num2 = parseFloat(line2.match(/^\d+\.\d+/));
                            return num1 - num2;
                        });

                        write = sortedLines.join('\n');

                        fs.writeFile(logs.fileBuffer00, write, function (err) {
                            if (err) {
                                return console.log(err);
                            }
                        });
                    });
                    setTimeout(function () {
                        checkIn();
                        checkKill();
                        checkOut();
                        checkMap()
                    }, 100);
                });
            });
        };
        function checkMap() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Map: ON');
            var file = fs.readFileSync(logs.fileBuffer00).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('Loading /Lotus/Levels/PVP/') > -1 && e.indexOf('.level') > -1) {
                        date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = mapName((e.slice(e.indexOf('PVP/') + 4, e.indexOf('.level'))));
                        if (n != currentMap) {
                            console.log(date + 'Novo mapa será: ' + n + '.');
                            logchannel.send(`\`${date}Novo mapa será: ${n}.\``);
                            currentMap = n;
                        } else
                            return;
                    };
                }, tempo);
                tempo += 1019; // k
            });

            function mapName(n) {
                if (isBlank(maps[n])) {
                    maps[n] = '[' + n + ']';
                    fs.writeFile('./maps.json', JSON.stringify(maps, null, '\t'), 'utf-8', (err) => {
                        if (err) throw err;
                    });
                };
                return maps[n];
            };
        };
        function checkIn() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'In: ON');
            var file = fs.readFileSync(logs.fileBuffer00).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('AddPlayerToSession') > -1) {
                        date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = e.slice(e.indexOf('AddPlayerToSession(') + 19, e.indexOf(',mm='));
                        console.log(date + n + ' conectou-se a sessão.');
                        logchannel.send(`\`${date}${n} conectou-se a sessão.\``);
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkOut() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Out: ON');
            var file = fs.readFileSync(logs.fileBuffer00).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('Server: Client') > -1 && e.indexOf('disconnected') > -1) {
                        date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = e.slice(e.indexOf('Client ') + 8, e.indexOf('" disconnected'));
                        console.log(date + n + ' desconectou-se a sessão.');
                        logchannel.send(`\`${date}${n} desconectou-se a sessão.\``);
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkKill() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Kill: ON');
            var file = fs.readFileSync(logs.fileBuffer00).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('was killed') > -1 && e.indexOf('using a') > -1) {
                        date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        if (e.indexOf('/Layer') > -1 || e.indexOf('DamageTrigger') > -1) {
                            var death = e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by'));
                            var damage = e.slice(e.indexOf('killed by ') + 10, e.indexOf(' damage'));
                            var kill = 'Mapa';
                            var source = '???';
                            if (e.indexOf('/Layer4') > -1) {
                                if (e.indexOf('DamageTrigger3') > -1) {
                                    source = 'Environment';
                                } else {
                                    source = 'Grineer Poison';
                                }
                            } else if (e.indexOf('/Layer1/DamageTrigger0') > -1) {
                                source = 'Electric Floor';
                            } else if (e.indexOf('/Layer1/DamageTrigger1') > -1) {
                                source = 'Fire';
                            } else if (e.indexOf('/Layer2/CorpusCoreLaserBeam') > -1) {
                                soruce = 'Corpus Laser Beam';
                            } else {
                                source = 'Environment';
                            };

                            console.log(date + death + ' foi morto pelo ' + kill + ' usando ' + source + ' com dano de ' + damage + '. MAP');
                        } else {
                            var death = e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by'));
                            var damage = e.slice(e.indexOf('killed by ') + 10, e.indexOf(' damage'));
                            var kill = e.slice(e.indexOf('damage from ') + 12, e.indexOf(' using'));
                            var source = killName(e.slice(e.indexOf(' using a ') + 10, e.length));

                            if (kill == 'a level 20 TURRET') { kill = 'Mapa' };

                            console.log(date + death + ' foi morto pelo ' + kill + ' usando ' + source + ' com dano de ' + damage + '. GUN');
                        };
                        logchannel.send(`\`${date}${death} foi morto pelo ${kill} usando ${source} com dano de ${damage}.\``);
                    };
                }, tempo);
                tempo += 519; //! k
            });

            function killName(n) {
                if (isBlank(kills[n])) {
                    kills[n] = '[' + n + ']';
                    fs.writeFile('./kills.json', JSON.stringify(kills, null, '\t'), 'utf-8', (err) => {
                        if (err) throw err;
                    });
                };
                return kills[n];
            };
        };

        String.prototype.cUp = function () {
            return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        }
        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        };
    },
};

