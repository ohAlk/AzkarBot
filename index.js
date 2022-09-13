const { MessageEmbed, Permissions, Client, Intents } = require('discord.js');
const { readFileSync, writeFileSync } = require("fs")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

// Bot Prefix
const prefix = "+";

// Logging when the bot is online and start sending prayers
client.on("ready", () => {
    console.log(`Ready as > ${client.user.username}`);

    setInterval(() => {
        let file = JSON.parse(readFileSync("configAzkar.json"));
        if (file.length < 1) return;
        for (let i of file) {
            let { channelId } = i
            let channel = client.channels.cache.get(channelId);

            if (channel) {
                let azkarFile = JSON.parse(readFileSync("azkar.json"));
                let randomZkr = azkarFile[Math.floor(Math.random() * azkarFile.length)];

                let embed = new MessageEmbed()
                    .setDescription(randomZkr)
                    .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                    .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
                    .setColor("BLUE");

                channel.send({ embeds: [embed] }).catch(e => console.log(`cant't send because: ${e}`));
            }
        }
    }, 3600000) // 1hour
});


let azkarFile = require("./azkar.json")

client.on("messageCreate", async message => {
    if (message.content.startsWith(prefix + "set-azkar")) {
        let { channel, guild, member } = message;

        // the config file
        let file = JSON.parse(readFileSync("configAzkar.json"));

        // funtion for replying to message 
        function returnMsg(content) {
            message.reply({ content }).catch(e => console.log("ERR: " + e))
        }
        // return if message is not in the guild, or is writtin by a bot
        if (!guild || message.author.bot) return;

        // checking for member Permissions
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return returnMsg("يتطلب تنفيذ الأمر إمتلاكك لصلاحيات ADMINISTRATOR");

        let helpText = `${prefix}set-azkar <#channel>\n${prefix}set-azkar ${channel}`

        // spliting the message from +set-azkar #azkar to ["+set-azkar", "#azkar"]
        let args = message.content.split(" ");

        // The Channel, will take the current channel if no channel is mentioned
        let target = message.mentions.channels.first() || guild.channels.cache.get(args[1]) || channel;

        // return if there's no channel, mostly won't happen
        if (!target) return returnMsg("يرجى منشن روم لتعيينه\n\n" + helpText);

        // chcking if already assign
        let isExist = file.find(c => c.channelId == target.id);
        if (isExist) return returnMsg("تم تحديد الروم مسبقا");

        // checking the type of the channel, only accepting TEXT or NEWS type
        if (target.type != "GUILD_NEWS" && target.type != "GUILD_TEXT") return returnMsg("لايمكن تحديد هذا النوع من الروم");

        // checking for bot permissions in that channel, must have send and read permission
        if (!target.permissionsFor(guild.me).toArray().includes('VIEW_CHANNEL')
            || !target.permissionsFor(guild.me).toArray().includes('SEND_MESSAGES')
        ) return returnMsg("**تأكد من إمتلاكي لصلاحيات View Channel و Send Messages**");

        // assinging the data to config file
        file.push({
            guildId: guild.id,
            channelId: target.id
        });
        writeFileSync("configAzkar.json", JSON.stringify(file));

        returnMsg(`سيتم إرسال الأذكار إلى ${target}`)

    } else if (message.content.startsWith(prefix + "stop-azkar")) {
        let { channel, guild, member } = message;
        
        // the config file
        let file = JSON.parse(readFileSync("configAzkar.json"));

        // funtion for replying message 
        function returnMsg(content) {
            message.reply({ content }).catch(e => console.log("ERR: " + e))
        }
        
        // return if message is not in the guild, or is writtin by a bot
        if (!guild || message.author.bot) return;

        // checking for member Permissions
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return returnMsg("يتطلب تنفيذ الأمر إمتلاكك لصلاحيات ADMINISTRATOR");

        let helpText = `${prefix}stop-azkar <#channel>\n${prefix}stop-azkar ${channel}`

        // spliting the message from +stop-azkar #azkar to ["+stop-azkar", "#azkar"]
        let args = message.content.split(" ");

        // The Channel, will take the current channel if no channel is mentioned
        let target = message.mentions.channels.first() || guild.channels.cache.get(args[1]) || channel;

        // return if there's no channel, mostly won't happen
        if (!target) return returnMsg("يرجى منشن الروم المراد إزالته\n\n" + helpText);

        // chcking if channel isn't assign
        let isExist = file.find(c => c.channelId == target.id);
        if (!isExist) return returnMsg("لم يتم تحديد الروم بالفعل");

        // removing the channel from the data
        file = file.filter(c => c.channelId != target.id);

        // saving the data
        writeFileSync("configAzkar.json", JSON.stringify(file));

        returnMsg(`تم إيقاف إرسال الأذكار إلى ${target}`)
    }
});



client.login("Your Token Is Here");
