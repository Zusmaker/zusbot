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
        var maps = require('../../maps.json');
        var kills = require('../../kills.json');
        var currentMap = '';
        var fileBuffer = [logs.fileBuffer00, logs.fileBuffer01, logs.fileBuffer02, logs.fileBuffer03]

        function checkLogs() {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Logs: ON');
            var files = [logs.fileDS00, logs.fileDS01, logs.fileDS02, logs.fileDS03];

            files.forEach(function (file, index) {
                fs.access(file, fs.constants.F_OK, function (err) {
                    if (err) {
                        console.log(date + `ヽ(#ﾟДﾟ)ﾉ┌┛ LOG ${file} NON ECZISTE!`);
                        return;
                    };

                    fs.open(file, 'r', function (err, fd) {
                        if (err) {
                            console.log('ヽ(#ﾟДﾟ)ﾉ┌┛ Erro ao abrir o arquivo:', err);
                            return;
                        };

                        fs.watchFile(file, function (cstat, pstat) {
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

                                fs.writeFile(fileBuffer[index], write, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            });
                            setTimeout(function () {
                                checkIn(index);
                                checkKill(index);
                                checkOut(index);
                                checkMap(index)
                            }, 100);
                        });
                    });
                });
            });
        };
        function checkMap(fileIndex) {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Map: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('Loading /Lotus/Levels/PVP/') > -1 && e.indexOf('.level') > -1) {
                        date = new Date().toLocaleTimeString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = mapName((e.slice(e.indexOf('PVP/') + 4, e.indexOf('.level'))));
                        if (n != currentMap) {
                            console.log(fileIndex + date + '|Novo mapa será: ' + n + '.');
                            logchannel.send(`:purple_square: ${fileIndex} | ${date} Novo mapa será: ${n}.`);
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
                    fs.writeFile(logs.maps, JSON.stringify(maps, null, '\t'), 'utf-8', (err) => {
                        if (err) throw err;
                    });
                };
                return maps[n];
            };
        };
        function checkIn(fileIndex) {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'In: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('AddPlayerToSession') > -1) {
                        date = new Date().toLocaleTimeString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = e.slice(e.indexOf('AddPlayerToSession(') + 19, e.indexOf(',mm='));
                        console.log(fileIndex + date + n + ' conectou-se a sessão.');
                        logchannel.send(`:green_square: ${fileIndex} | ${date} ${n} conectou-se a sessão.`);
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkOut(fileIndex) {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Out: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('Server: Client') > -1 && e.indexOf('disconnected') > -1) {
                        date = new Date().toLocaleTimeString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

                        var n = e.slice(e.indexOf('Client ') + 8, e.indexOf('" disconnected'));
                        console.log(fileIndex + date + n + ' desconectou-se a sessão.');
                        logchannel.send(`:red_square: ${fileIndex} | ${date} ${n} desconectou-se a sessão.`);
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkKill(fileIndex) {
            date = new Date().toLocaleString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

            console.log(date + 'Kill: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.indexOf('was killed') > -1 && e.indexOf('using a') > -1) {
                        date = new Date().toLocaleTimeString('pt-Br', { timeZone: 'America/Sao_Paulo' }).concat(' | ');

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

                            console.log(fileIndex + date + death + ' foi morto pelo ' + kill + ' usando ' + source + ' com dano de ' + damage + '. MAP');
                            logchannel.send(`:brown_square: ${fileIndex} | ${date}:hotsprings: ${death} foi morto pelo ${kill} usando ${source} com dano de ${damage}.`);
                        } else {
                            var death = e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by'));
                            var damage = e.slice(e.indexOf('killed by ') + 10, e.indexOf(' damage'));
                            var kill = e.slice(e.indexOf('damage from ') + 12, e.indexOf(' using'));
                            var source = killName(e.slice(e.indexOf(' using a ') + 9, e.length));

                            if (kill == 'a level 20 TURRET') { kill = 'Mapa' };

                            console.log(fileIndex + date + death + ' foi morto pelo ' + kill + ' usando ' + source + ' com dano de ' + damage + '. GUN');
                            logchannel.send(`:yellow_square: ${fileIndex} | ${date}:crossed_swords: ${death} foi morto pelo ${kill} usando ${source} com dano de ${damage}.`);
                        };
                    };
                }, tempo);
                tempo += 519; //! k
            });

            function killName(n) {
                if (isBlank(kills[n])) {
                    kills[n] = '[' + n + ']';
                    fs.writeFile(logs.kills, JSON.stringify(kills, null, '\t'), 'utf-8', (err) => {
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

