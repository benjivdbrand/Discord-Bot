require('dotenv').config()
const Discord = require('discord.js')
const { Timer } = require('easytimer.js')
const client = new Discord.Client()
const ms = require('ms')

//directly when bot is turned on
client.on('ready', () => {
    //displaying bot name
    console.log("Connected as " + client.user.tag)

    //setting up activity
    client.user.setActivity("You struggle", {type: "WATCHING"})

    //doing something for each guild
    client.guilds.cache.forEach((guild) => {
        //print out guild names
        console.log(guild.name)

        //doing something for each channel
        guild.channels.cache.forEach((channel) => {
            //print out channel name, type and ID
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
        //General channel id: 836595717808062568
    })
    
    //create a general channel with use of ID
    let generalChannel = client.channels.cache.get("836595717808062568")
    //send file(doggo)
    generalChannel.send({files: ["https://opgelicht.assets.avrotros.nl/media_import/puppy.jpg"]})
})

//doing something for every message received
client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) {
        return
    }
    //reacting to all messages
    receivedMessage.channel.send("message received " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    //emoji usage
    receivedMessage.react("😁")

    //! command setup
    if(receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage)
    }
})

//processing and setting up commands
async function processCommand(receivedMessage){
    let generalChannel = client.channels.cache.get("837304997053595698")
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.splice(1)

    //help command setup
    if (primaryCommand == "help"){
        helpCommand(arguments, receivedMessage)

    }

    //doggo command setup and function
    if (primaryCommand == "doggo"){
        receivedMessage.channel.send({files: ["https://opgelicht.assets.avrotros.nl/media_import/puppy.jpg"]})
    }

    //joining voicechannel
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

    if (primaryCommand == "timer"){
        if (!arguments[0]){
            console.log("test1")
            return receivedMessage.channel.send("Gebruik: !timer + tijd + s|m|h")
        }

        if (arguments[0]<=0){
            console.log("test2")
            return receivedMessage.channel.send("Gebruik: !timer + tijd + s|m|h")
        }

        timer(receivedMessage, arguments)
    }
}

//Help command function
function helpCommand(arguments, receivedMessage){
    if (arguments.length == 0) {
        receivedMessage.channel.send("I'm not sure what you need help with. Try !help[topic]")
    } else {
        receivedMessage.channel.send("It looks like you need help with " + arguments)
    }
}

//timer functionality
async function timer(receivedMessage, arguments){
    let timerLength = arguments[0]
    let timerInfo = ""
    for (i =1; i< arguments.length;i++){
        timerInfo = timerInfo + arguments[i] + " "
    }

    let timer = new Timer()
    timer.start({countdown: true, startValues: {seconds: ms(timerLength)/1000}})
    console.log(timer.getTimeValues().toString())
    let sent = await receivedMessage.channel.send("timer gedurende: "+ ms(ms(timerLength, {long: true})))
    let id = sent.id
    let counter = 0
    timer.addEventListener('secondsUpdated', function (e){
        counter ++
        if (counter == 5){
            editMessage = receivedMessage.channel.messages.fetch(id)
            if (ms(timerLength)> 86400000){
                const units = ['days', 'hours', 'minutes', 'seconds']
                editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString(units))});
            } else {
                editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString())});
            }
            counter = 0
        }
    })
    timer.addEventListener('targetAchieved', function (e) {
        editMessage = receivedMessage.channel.messages.fetch(id)
        editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString())});
        if (timerInfo == ""){
            receivedMessage.channel.send("De timer is klaar")
        }else {
            receivedMessage.channel.send("De timer is klaar. De timer was genaamd: " + timerInfo)
        }
    });
}

//bot token identification
client.login(process.env.TOKEN)
