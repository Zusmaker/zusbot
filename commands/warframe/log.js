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
        var sources = require('./sources.json');
        var serverData = require('./serverData.json');
        var startTime = '';
        var currentMap = '';
        var kill = {};
        var fileBuffer = [logs.fileBuffer00, logs.fileBuffer01, logs.fileBuffer02, logs.fileBuffer03]

        function checkLogs() {
            date = new Date().toLocaleString('pt-Br');

            console.log(date + ' | Logs: ON');
            var files = [logs.fileDS00, logs.fileDS01, logs.fileDS02, logs.fileDS03];

            files.forEach(function (file, index) {
                fs.access(file, fs.constants.F_OK, function (err) {
                    if (err) {
                        console.log(date + `ヽ(#ﾟДﾟ)ﾉ┌┛ LOG ${file} NON ECZISTE!`);
                        return;
                    };
                    lastline = "";
                    fs.open(file, 'r', function (err, fd) {
                        if (err) {
                            console.log('ヽ(#ﾟДﾟ)ﾉ┌┛ Erro ao abrir o arquivo:', err);
                            return;
                        };
                        if (index === 0) {
                            fs.readFile(file, 'utf8', function (err, data) {
                                if (err) {
                                    console.log('ヽ(#ﾟДﾟ)ﾉ┌┛ Erro ao ler o arquivo:', err);
                                    return;
                                };
                                var sortedLines = data.replace(/(\r\n|\r|\n)/g, '\n').split('\n').sort(function (line1, line2) {
                                    var num1 = parseFloat(line1.match(/^\d+\.\d+/));
                                    var num2 = parseFloat(line2.match(/^\d+\.\d+/));
                                    return num1 - num2;
                                });

                                startTime = new Date(getStartTime(sortedLines[5])).getTime();
                                console.log(`Server Start: ${startTime} milisegundos`);
                            });
                        };
                        fs.watchFile(file, function (cstat, pstat) {
                            var delta = cstat.size - pstat.size;
                            if (delta <= 0) return;
                            fs.read(fd, new Buffer.alloc(delta), 0, delta, pstat.size, function (err, bytes, buffer) {
                                bwrite = buffer.toString().replace(/(\r\n|\r|\n)/g, '\n').split('\n');
                                write = '' + lastline;
                                lastline = bwrite.pop();
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
            date = new Date().toLocaleString('pt-Br');

            console.log(date + ' | Map: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.includes('Loading /Lotus/Levels/PVP/') && e.includes('.level')) {
                        var timestamp = new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', '')));
                        date = timestamp.toLocaleString('pt-Br');

                        var mapName = mapsNames((e.slice(e.indexOf('PVP/') + 4, e.indexOf('.level'))));
                        if (mapName != currentMap) {
                            console.log(fileIndex + ' | ' + date + ' | Novo mapa será: ' + mapName + '.');
                            logchannel.send(`:purple_square: ${fileIndex} | ${date} | Novo mapa será: ${mapName}.`);
                            currentMap = mapName;
                        } else
                            return;
                    };
                }, tempo);
                tempo += 1019; // k
            });

            function mapsNames(mapName) {
                if (isBlank(maps[mapName])) {
                    maps[mapName] = '[' + mapName + ']';
                    fs.writeFile(logs.maps, JSON.stringify(maps, null, '\t'), 'utf-8', (err) => {
                        if (err) throw err;
                    });
                };
                return maps[mapName];
            };
        };
        function checkIn(fileIndex) {
            date = new Date().toLocaleString('pt-Br');

            console.log(date + ' | In: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.includes('AddPlayerToSession')) {
                        var timestamp = new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', '')));
                        date = timestamp.toLocaleString('pt-Br');

                        var playerName = e.slice(e.indexOf('AddPlayerToSession(') + 19, e.indexOf(',mm='));

                        console.log(fileIndex + ' | ' + date + ' | ' + playerName + ' conectou-se a sessão.');
                        logchannel.send(`:green_square: ${fileIndex} | ${date} | ${playerName} conectou-se a sessão.`);
                        updateData(fileIndex,date,'In');
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkOut(fileIndex) {
            date = new Date().toLocaleString('pt-Br');

            console.log(date + ' | Out: ON');
            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var tempo = 0;
            file.forEach(function (e) {
                setTimeout(function () {
                    if (e.includes('Server: Client') && e.includes('disconnected')) {
                        var timestamp = new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', '')));
                        date = timestamp.toLocaleString('pt-Br');

                        var playerName = e.slice(e.indexOf('Client ') + 8, e.indexOf('" disconnected'));
                        console.log(fileIndex + ' | ' + date + ' | ' + playerName + ' desconectou-se a sessão.');
                        logchannel.send(`:red_square: ${fileIndex} | ${date} | ${playerName} desconectou-se a sessão.`);
                    };
                }, tempo);
                tempo += 1019; // k
            });
        };
        function checkKill(fileIndex) {
            date = new Date().toLocaleString('pt-Br');
            console.log(date + ' | Kill: ON');

            var file = fs.readFileSync(fileBuffer[fileIndex]).toString().split('\n');

            var kills = [];
            file.forEach(function (e) {
                if (e.includes(' was killed ') && e.includes(' using a ')) {   
                    var source = killName(e.slice(e.indexOf(' using a ') + 9, e.length));
                    if (e.includes('/Layer') || e.includes('DamageTrigger')) {
                        kill = {
                            date: new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', ''))).toLocaleString('pt-BR'),
                            death: e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by')),
                            killer: 'Mapa'
                        };
                        if (e.includes('/Layer4')) {
                            if (e.includes('DamageTrigger3')) {
                                kill.source = 'Environment';
                            } else {
                                kill.source = 'Grineer Poison';
                            }
                        } else if (e.includes('/Layer1/DamageTrigger0')) {
                            kill.source = 'Electric Floor';
                        } else if (e.includes('/Layer1/DamageTrigger1')) {
                            kill.source = 'Fire';
                        } else if (e.includes('/Layer2/CorpusCoreLaserBeam')) {
                            kill.source = 'Corpus Laser Beam';
                        } else {
                            kill.source = '???';
                        };
                        if (e.slice(e.indexOf('by ') + 3, e.indexOf(' damage')).indexOf("/") > -1) {
                            kill.dmg = e.slice(e.indexOf('by ') + 3, e.indexOf(' / '));
                            kill.dmgmax = e.slice(e.indexOf(' / ') + 3, e.indexOf(' damage'));
                        } else {
                            kill.dmg = "0";
                            kill.dmgmax = e.slice(e.indexOf('by ') + 3, e.indexOf(' damage'));
                        };
                    } else {
                        kill = {
                            date: new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', ''))).toLocaleString('pt-BR'),
                            death: e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by')),
                            killer: e.slice(e.indexOf('damage from ') + 12, e.indexOf(' using a ')),
                            source: source
                        };
                        if (e.slice(e.indexOf('by ') + 3, e.indexOf(' damage')).indexOf("/") > -1) {
                            kill.dmg = e.slice(e.indexOf('by ') + 3, e.indexOf(' / '));
                            kill.dmgmax = e.slice(e.indexOf(' / ') + 3, e.indexOf(' damage'));
                        } else {
                            kill.dmg = "0";
                            kill.dmgmax = e.slice(e.indexOf('by ') + 3, e.indexOf(' damage'));
                        };
                    };
                    if (kill.killer == 'a level 20 TURRET') { kill.killer = 'Grineer Turret' };
                    kills.push(kill);
                } else if (e.includes(' was killed ')) {
                    kill = {
                        date: new Date(startTime + parseInt(e.slice(0, e.indexOf('.') + 4).replace('.', ''))).toLocaleString('pt-BR'),
                        death: e.slice(e.indexOf('[Info]: ') + 8, e.indexOf(' was killed by')),
                        killer: e.slice(e.indexOf('damage from ') + 12),
                        source: 'Bullet Jump'
                    };
                    if (e.slice(e.indexOf('by ') + 3, e.indexOf(' damage')).indexOf("/") > -1) {
                        kill.dmg = e.slice(e.indexOf('by ') + 3, e.indexOf(' / '));
                        kill.dmgmax = e.slice(e.indexOf(' / ') + 3, e.indexOf(' damage'));
                    } else {
                        kill.dmg = "0";
                        kill.dmgmax = e.slice(e.indexOf('by ') + 3, e.indexOf(' damage'));
                    };
                    kills.push(kill);
                };
            });
            var tempo = 0;
            kills.forEach(function (e) {
                setTimeout(function () {
                    if (e.killer == "Mapa") {
                        console.log(fileIndex + ' | ' + e.date + ' | ' + e.killer + ' matou ' + e.death + ' com ' + e.source + ', com dano de: ' + e.dmg + ' [máx.: ' + e.dmgmax + ']');
                        logchannel.send(`:brown_square: ${fileIndex} | ${e.date} | :hotsprings: ${e.killer} matou ${e.death} com ${e.source}, com dano de: ${e.dmg} [máx.: ${e.dmgmax}].`);
                    } else if (e.source == "Bullet Jump") {
                        console.log(fileIndex + ' | ' + e.date + ' | ' + e.killer + ' matou ' + e.death + ' com ' + e.source + ', com dano de: ' + e.dmg + ' [máx.: ' + e.dmgmax + ']');
                        logchannel.send(`:yellow_square: ${fileIndex} | ${e.date} | :mechanical_leg: ${e.killer} matou ${e.death} com ${e.source}, com dano de: ${e.dmg} [máx.: ${e.dmgmax}].`);
                    } else {
                        console.log(fileIndex + ' | ' + e.date + ' | ' + e.killer + ' matou ' + e.death + ' com ' + e.source + ', com dano de: ' + e.dmg + ' [máx.: ' + e.dmgmax + ' ]');
                        logchannel.send(`:yellow_square: ${fileIndex} | ${e.date} | :crossed_swords: ${e.killer} matou ${e.death} com ${e.source}, com dano de: ${e.dmg} [máx.: ${e.dmgmax}].`);
                    };
                    updateData(fileIndex, date, 'Kill');
                }, tempo);
                tempo += 1019; //! k
            });
        };

        function updateData(fileIndex,date,tipo) {
            var hora = new Date(date).getHours();
            var dia = funfaDay(date);
            var partida = '';
            var horario = '';
            /*
                Servidores iniciais pra verificar qual vale a pena manter ativo no dia a dia
                SA = South America, NA = North America, DM = Death Match, RC = Recruit Mode: ON
            */
            switch (fileIndex) {
                case 0:
                    partida = 'SAdsDM';
                    break;
                case 1:
                    partida = 'NAdsDM';
                    break;
                case 2:
                    partida = 'SAdsDMRC';
                    break;
                case 3:
                    partida = 'NAdsDMRC';
                    break;
            };
            switch (dia) {
                case 0:
                    dia = 'day_0';
                    break;
                case 1:
                    dia = 'day_1';
                    break;
                case 2:
                    dia = 'day_2';
                    break;
                case 3:
                    dia = 'day_3';
                    break;
                case 4:
                    dia = 'day_4';
                    break;
                case 5:
                    dia = 'day_5';
                    break;
                case 6:
                    dia = 'day_6';
                    break;
            };
            if (hora >= 0 && hora < 3) {
                horario = '00:00 a 02:59';
            } else if (hora >= 3 && hora < 6) {
                horario = '03:00 a 05:59';
            } else if (hora >= 6 && hora < 9) {
                horario = '06:00 a 08:59';
            } else if (hora >= 9 && hora < 12) {
                horario = '09:00 a 11:59';
            } else if (hora >= 12 && hora < 15) {
                horario = '12:00 a 14:59';
            } else if (hora >= 15 && hora < 18) {
                horario = '15:00 a 17:59';
            } else if (hora >= 18 && hora < 21) {
                horario = '18:00 a 20:59';
            } else {
                horario = '21:00 a 23:59';
            };
            switch (tipo){
                case 'In':
                    console.log(`++In`);
                    serverData[partida].totalIn++;
                    serverData[partida][dia][horario].In++;
                    break;
                case 'Kill':
                    console.log(`++Kill`);
                    serverData[partida].totalKill++;
                    serverData[partida][dia][horario].Kill++;
                    break;
            };
            fs.writeFile(logs.serverData, JSON.stringify(serverData, null, '\t'), 'utf-8', (err) => {
                if (err) throw err;
            });
        };
        function funfaDay(dataString){
            // ヽ(#ﾟДﾟ)ﾉ┌┛ mm/dd/yyyy para getDay()
            const partes = dataString.split(' ');
            const dataPartes = partes[0].split('/');
            const horaPartes = partes[1].split(':');

            const dia = parseInt(dataPartes[0], 10);
            const mes = parseInt(dataPartes[1], 10) - 1;
            const ano = parseInt(dataPartes[2], 10);
            const hora = parseInt(horaPartes[0], 10);
            const minutos = parseInt(horaPartes[1], 10);
            const segundos = parseInt(horaPartes[2], 10);

            const data = new Date(ano, mes, dia, hora, minutos, segundos);
            const diaSemana = data.getDay();

            return diaSemana;
        }
        function getStartTime(line) {
            try {
                var time = line.slice(32, line.indexOf(' [UTC'));
                return new Date(time).getTime();
            } catch (e) {
                console.log("Sヽ(#ﾟДﾟ)ﾉ┌┛ Inicie os servers primeiro!");
                process.exit();
            };
        };
        function killName(n) {
            if (isBlank(sources[n])) {
                sources[n] = '[' + n + ']';
                fs.writeFile(logs.sources, JSON.stringify(sources, null, '\t'), 'utf-8', (err) => {
                    if (err) throw err;
                });
            };
            return sources[n];
        };
        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        };
    },
};
