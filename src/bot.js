require('dotenv').config()
const Discord = require('discord.js')
const { Timer } = require('easytimer.js')
const client = new Discord.Client()
const ms = require('ms')

require('@tensorflow/tfjs')
const toxicity = require('@tensorflow-models/toxicity')

//directly when bot is turned on
client.on('ready', () => {
    //displaying bot name
    console.log("Connected as " + client.user.tag)

    //setting up activity
    client.user.setActivity("You struggle", {type: "WATCHING"})

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
    // let generalChannel = client.channels.cache.get("836595717808062568")

    //send file(doggo)
    // generalChannel.send({files: ["https://opgelicht.assets.avrotros.nl/media_import/puppy.jpg"]})
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

    //when a link is in a message, sent that message to link function
    if (receivedMessage.content.includes("https://") || receivedMessage.content.includes("http://") || receivedMessage.content.includes("www.")){
        //exclude tenor GIFs from going to links
        if (!receivedMessage.content.includes("https://tenor.com")){
            link(receivedMessage)
        }
    }

    //if a file is in a messge, send it to file function
    if (receivedMessage.attachments.size > 0){
        //check if the added files are pictures of any kind
        if ((receivedMessage.attachments.first().url.includes(".png"))==true || (receivedMessage.attachments.first().url.includes(".jpg"))==true || (receivedMessage.attachments.first().url.includes(".jepg"))==true){
            file(receivedMessage, "pictures")
        //if not pictures, then they are files
        }else{
            file(receivedMessage, "files")
        }
    }

    moderation(receivedMessage)

    //! command setup
    if(receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage)
    }
})

//processing and setting up commands and arguments
async function processCommand(receivedMessage){
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
        //timer command without arguments gets feedback message
        if (!arguments[0]){
            return receivedMessage.channel.send("Gebruik: !timer + tijd + s|m|h")
        }

        //starting timer function
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
    //first argument is timer length
    let timerLength = arguments[0]
    let timerInfo = ""

    //adding all arguments except timer length as information about timer in one String
    for (i =1; i< arguments.length;i++){
        timerInfo = timerInfo + arguments[i] + " "
    }

    //create and start the timer
    let timer = new Timer()
    timer.start({countdown: true, startValues: {seconds: ms(timerLength)/1000}})
    
    //send a message about the timer and save the message id
    let timerMessage = await receivedMessage.channel.send("timer gedurende: "+ ms(ms(timerLength, {long: true})))
    let id = timerMessage.id
    
    //pin the timer message
    timerMessage.pin()

    let counter = 0
    
    //Event listener that activates everytime a second passes by
    timer.addEventListener('secondsUpdated', function (e){
        //timer only updates every 5 seconds, so counter is added
        counter ++
        if (counter == 5){
            //channel where the message was send to
            editMessage = receivedMessage.channel.messages.fetch(id)

            //if the timer is longer then 24 hours, the timer will display days in the timer
            if (ms(timerLength)> 86400000){
                const units = ['days', 'hours', 'minutes', 'seconds']
                //edit the timer message with days
                editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString(units))});
            } else {
                //edit the tiemr message without days
                editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString())});
            }
            counter = 0
        }
    })

    //Event listener for when timer reaches 0
    timer.addEventListener('targetAchieved', function (e) {
        //fetch message id of timer message
        editMessage = receivedMessage.channel.messages.fetch(id)

        //sometimes the timer skips a second making it not end at zero, so set the timer to 0
        //the timer is accurate, only due to lag it sometimes goes to values that are no multiple of 5
        editMessage.then(message => {message.edit("Timer status: " + timer.getTimeValues().toString())});
        
        if (timerInfo == ""){
            //if there is no timer information added, a simple message is send
            receivedMessage.channel.send("De timer is klaar")

        }else {
            //if there is timer information added, a message including timer information is send
            receivedMessage.channel.send("De timer is klaar. De timer was genaamd: *" + timerInfo +"*")
        }

        //unpin message
        timerMessage.unpin()
    });
}

//the text moderation function
async function moderation(receivedMessage){
    //threshold for when a message is named toxic
    const threshold = 0.8

    let toxic = false
    let toxicArray = []

    //create a channel toxic-report if it does not exist
    if (receivedMessage.guild.channels.cache.some(channel => channel.name === "toxic-report")==false)
        receivedMessage.guild.channels.create("toxic-report", {
            type: 'text'
        }).then(channel =>{
            console.log(channel)
        })

    //load the toxicity model
    toxicity.load(threshold).then(model => {
        //the send message
        const sentence = [String(receivedMessage.content)]

        //sorting checking if message was toxic and adding toxicity labels to array
        model.classify(sentence).then(predictions =>{            
            for (i =0; i<7;i++){
                if (predictions[i].results[0].match == true){
                    toxicArray.push(predictions[i].label)
                    toxic = true
                }
            }
            //listing the array of toxic labels in words
            if (toxic == true){
                for (i=0; i<toxicArray.length; i++){
                    if (i == 0){
                        toxicLabels = toxicArray[i]
                    }
                    else if(i == toxicArray.length-1){
                        toxicLabels += " and " + toxicArray[i]
                    }
                    else{
                        toxicLabels += ", " + toxicArray[i]
                    }
                }
                //creating the message
                informationMessage = "A message has been flagged with **" + toxicLabels + "**.\n"
                informationMessage += "The message: *" + receivedMessage.content + "*\n"
                informationMessage += "Link to the message: "+receivedMessage.url
                
                //getting toxic-report channel and sending message
                const toxicChannel = receivedMessage.guild.channels.cache.find(channel => channel.name === 'toxic-report')
                toxicChannel.send(informationMessage)
            }
        })
    })
}

async function link(receivedMessage){
    //check if a channel links exists, if not, create one
    if (receivedMessage.guild.channels.cache.some(channel => channel.name === "links")==false){
        console.log("test check")
        receivedMessage.guild.channels.create("links", {
            type: 'text'
        }).then(channel =>{
            //send the link
            channel.send(receivedMessage)
        })
    }
    else {
        //find the channel with the correct name
        const linkChannel = receivedMessage.guild.channels.cache.find(channel => channel.name === 'links')
        //send the link
        linkChannel.send(receivedMessage)
    }
}

//function for sorting files and pictures(dependends on variable type)
async function file(receivedMessage, type){
    //check if channel exists, if not, create new channel
    if (receivedMessage.guild.channels.cache.some(channel => channel.name === type)==false){
        receivedMessage.guild.channels.create(type, {
            type: 'text'
        }).then(channel =>{
            //send the file/picture
            channel.send(receivedMessage.attachments.first().url)
        })
    }
    //when the channel already exists
    else {
        //find the channel with the correct name
        const fileChannel = receivedMessage.guild.channels.cache.find(channel => channel.name === type)
        //send the file/picture
        fileChannel.send(receivedMessage.attachments.first().url)
    }
}
//bot token identification
client.login(process.env.TOKEN)
