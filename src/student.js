require('dotenv').config()
const Discord = require('discord.js')
const clients = [new Discord.Client(), new Discord.Client(), new Discord.Client(), new Discord.Client(), new Discord.Client()]

for (i = 0; i < clients.length; i++) {
    clients[i].on('message', (receivedMessage) => {
        if (receivedMessage.author == clients.user) {
            return
        }

        if(receivedMessage.content.startsWith("!")) {
            processCommand(receivedMessage, i)
        }
    })
}

async function processCommand(receivedMessage, i){
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.splice(1)

    if (primaryCommand == "join"){
        // Only try to join the sender's voice channel if they are in one themselves
        if (receivedMessage.member.voice.channel){
            //join the channel
            const connection = await receivedMessage.member.voice.channel.join()
        } else {
            //fail message
            receivedMessage.reply("you need to join a voice channel first!")
        }
    }
}

token = [process.env.TOKEN_S1, process.env.TOKEN_S2, process.env.TOKEN_S3, process.env.TOKEN_S4, process.env.TOKEN_S5]
for (i = 0; i < clients.length; i++) {
    clients[i].login(token[i])
}

