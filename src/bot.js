const Discord = require('discord.js');
const client = new Discord.Client();
var questionList = [];

client.on('ready', readyDiscord);
client.on('message', receiveMessage);

function readyDiscord() {
    console.log(`Logged in as ${client.user.tag}!`);
}

function receiveMessage(msg) {
    const prefix = "!"

    if (!msg.content.startsWith(prefix) || msg.author.bot) return

    const args = msg.content.slice(prefix.length).trim().split(' '); //
    const command = args.shift().toLowerCase(); //
    const student = msg.member.user;

    //List of possible commands. Possible for students and teachers
    if (command === 'help') {
        msg.channel.send('Hello there! These are the commands that I support:');
        if ( msg.member.roles.cache.some(role => role.name === 'Teacher') ) {
            msg.channel.send('```![question/hand up/hand down/next/pick @<name>/pick <number>/list/clear]```')
        } else {
            msg.channel.send('```![question/hand up/hand down]```')
        }
    }

    //Commands for raising your hand. Possible for students and teachers
    if (command === 'question' || msg.content === prefix + 'hand up' ) {
        //Check if the person has not raised their hand yet
        if ( questionList.includes(student) ) {
            msg.reply('hand is already raised. Please wait for your turn.')
        } else {
            //If not raised, add them to the list of students with questions
            questionList.push(student)
            msg.channel.send("Hello <@!" + student + '>. Your hand is now raised.')
        }
    }

    //Commands for lowering your hand. Possible for students and teachers
    if (msg.content === prefix + 'hand down') {
        if ( !questionList.includes(student) ) {
            msg.reply('hand was already lowered.')
        } else {
            questionList = findStudent(questionList, student)
            msg.reply('your hand has been lowered.')
        }
    }
    //Next commands are for teachers only
    if ( msg.member.roles.cache.some(role => role.name === 'Teacher') ) {
        //Commands for picking the next student with a question. Possible for teachers only
        if (command === 'next') {
            //Check whether there are questions left
            if (questionList.length < 1) {
                msg.channel.send('There are no more questions.')
            } else {
                //Pick first student from the list
                const student = questionList[0]
                msg.channel.send('The next person with a question/comment is: <@!' + student + '>')
                //Delete this person from the list
                questionList.splice(0, 1)
            }
        }

        //Commands for picking a student from the list using their name/number. Possible for teachers only
        if (command === 'pick') {
            //Check whether list is empty
            if (questionList.length < 1) {
                msg.channel.send('All questions have been answered.')
                return
            }
            //Check whether it is an index or Discord ID
            //If it is an index
            if (args[0].length < 4) {
                var number = parseInt(args[0])
                if (number === 'NaN') {
                    msg.channel.send('Please use a positive number or @<name>.')
                    return
                }
                //Check whether the given number occurs in the list
                if (number > questionList.length) {
                    msg.channel.send('There is/are only ' + questionList.length + ' student(s) with raised hand(s)')
                } else if (number <= questionList.length && number > 0) {
                    //Pick student in the list with this index
                    const pickStudent = questionList[number - 1]
                    msg.channel.send('<@!' + pickStudent + '> had a question/comment.')
                    //Delete this person from the list
                    questionList.splice(number - 1, 1)
                } else {
                    msg.channel.send('Please pick a positive number.')
                }
                //If it is a Discord ID
            } else if (args[0].length === 21 || args[0].length === 22) {
                const pickStudent = args[0].slice(3, args[0].length - 1)
                var idList = -2
                idList = findMemberID(questionList, pickStudent)
                //Check whether mentioned student is included in the list
                if (idList === -2) {
                    msg.channel.send('<@!' + pickStudent + '> is not present in the list.')
                } else {
                    msg.channel.send('<@!' + pickStudent + '>, it is your turn to speak.')
                    questionList = idList
                }

            } else {
                msg.channel.send('Please use a positive number or @<name>.')
                return
            }
        }

        //Commands for showing the list. Possible for teachers only
        if (command === 'list') {
            let items = questionList.map((item, idx) =>
                `${idx + 1}. Name: ${questionList[idx]}`);
            if (items.length > 0) {
                msg.channel.send(createInfoEmbed('Currently holding up their hands:', items.join('\n\n')));
            } else {
                msg.channel.send(createInfoEmbed(`There are no more raised hands.`, 'Use ```!question``` or ```!hand up``` to add items.'));
            }
        }

        //Commands for clearing the list. Possible for teachers only
        if (command === 'clear') {
            if (questionList.length < 1) {
                msg.channel.send('List is already empty. Use ```!question``` or ```!hand up``` to add items.')
            } else {
                //Reset array of people with questions
                questionList = []
                msg.channel.send('List is empty again.')
            }
        }
    }

    if (command === 'helleuw') {
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

function findStudent(list, member) {
    //Go over the whole list to find the student
    for (var i = 0; i < list.length; i++) {
        if (list[i] === member) {
            list.splice(i, 1)
            return list
        }
    }
    return list
}

function findMemberID(list, pickStudent) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === pickStudent) {
            list.splice(i, 1)
            return list
        }
    }
    return -2
}

function createInfoEmbed(title, message) {
    return new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(message);
}

//Fill in token of bot to make it work
client.login("")
// Original token of Professor Doctor Heinz
// client.login("");