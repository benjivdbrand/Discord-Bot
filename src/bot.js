const Discord = require('discord.js');
const client = new Discord.Client();
var questionList = [];

client.on('ready', readyDiscord);
client.on('message', receiveMessage);

function readyDiscord() {
    console.log(`Logged in as ${client.user.tag}!`);
}

function receiveMessage(msg) {
    if (msg.author.bot) return

    const prefix = "!"

    //List of possible commands
    if (msg.content === prefix + 'help') {
        msg.channel.send('Hello there! These are the commands that I support:');
        msg.channel.send('```![question/hand up/hand down/next/pick < name >/list/clear]```');
    }

    //Commands for raising your hand
    if (msg.content === prefix + 'question' || msg.content === prefix + 'hand up' ) {
        //Check if the person has not raised their hand yet
        if ( questionList.includes(msg.member.user.tag) ) {
            msg.reply('hand is already raised. Please wait for your turn')
        } else {
            //If not raised, add them to the list of students with questions
            questionList.push(msg.member.user.tag)
            msg.channel.send("Hello " + msg.member.user.tag + '. Your hand is now raised')
        }
    }

    //Commands for lowering your hand
    if (msg.content === prefix + 'hand down') {
        for (var i = 0; i < questionList.length; i++) {
            if (questionList[i] === msg.member.user.tag) {
                questionList.splice(i, 1)
            }
        }
        msg.reply('your hand has been lowered.')
    }

    //Commands for showing the list
    if (msg.content === prefix + 'list') {
        let items = questionList.map((item, idx) =>
            `${idx + 1}. Name: ${questionList[idx]}`);
        if(items.length > 0) {
            msg.channel.send(createInfoEmbed('Currently holding up their hands:', items.join('\n\n')));
        } else {
            msg.channel.send(createInfoEmbed(`There are no more raised hands.`, 'Use ```!question``` or ```!hand up``` to add items.'));
        }
    }

    //Commands for clearing the list
    if (msg.content === prefix + 'clear') {
        if (questionList.length < 1) {
            msg.channel.send('List is already empty. Use ```!question``` or ```!hand up``` to add items.')
        } else {
            //Reset array of people with questions
            questionList = []
            msg.channel.send('List is empty again.')
        }
    }

    if (msg.content === prefix + 'helleuw') {
        msg.reply('hello there!');
    }

    if (msg.content === prefix + 'join') {
        msg.member.voice.channel.join().then(connection => {
            msg.reply('I joined the voice channel!');
        }).catch(e => {
            msg.reply('Could not find voice channel :(');
        });
    }

    if (msg.content === prefix + 'leave') {
        msg.guild.me.voice.channel.leave();
    }
}

function createInfoEmbed(title, message) {
    return new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(message);
}

client.login("ODM3MDcyNzI5MTkwNDMyODA4.YInOug.2LVk6-t-buRSF-xI35juRuvGREU")
// Original token of Professor Doctor Heinz
// client.login("ODM1OTc1NTgwODMwMDA3MzM2.YIXQ7g.it5gRU5Sv1zvPZ89MbM4NoOSIac");