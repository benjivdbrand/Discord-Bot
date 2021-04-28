const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', readyDiscord);
client.on('message', receiveMessage);

function readyDiscord() {
    console.log(`Logged in as ${client.user.tag}!`);
}

function receiveMessage(msg) {
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }

    if (msg.content === 'join') {
        msg.member.voice.channel.join().then(connection => {
            msg.reply('I joined the voice channel!');
        }).catch(e => {
            msg.reply('Could not find voice channel :(');
        });
    }

    if (msg.content === 'leave') {
        msg.guild.me.voice.channel.leave();
    }
}

client.login('ODM1OTc1NTgwODMwMDA3MzM2.YIXQ7g.it5gRU5Sv1zvPZ89MbM4NoOSIac');