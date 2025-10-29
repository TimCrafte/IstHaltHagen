const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function loadConfig() {
  return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

client.once('ready', () => {
  console.log(`Eingeloggt als ${client.user.tag}`);
  const config = loadConfig();
  console.log(`Überwache Nachrichten von Server: ${config.source.guild_id}, Kanal: ${config.source.channel_id}`);
});

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  const config = loadConfig();
  
  if (message.guild && message.guild.id === config.source.guild_id && message.channel.id === config.source.channel_id) {

    const authorName = message.member?.displayName || message.author.username;
    const forwardMessage = `${message.content}`;
    
    for (const target of config.targets) {
      try {
        const guild = client.guilds.cache.get(target.guild_id);
        if (guild) {
          const channel = guild.channels.cache.get(target.channel_id);
          if (channel) {

            await channel.send(forwardMessage);
            
            message.attachments.forEach(async (attachment) => {
              await channel.send(attachment.url);
            });
          }
        }
      } catch (error) {
        console.error(`Fehler beim Senden an ${target.guild_id}/${target.channel_id}:`, error);
      }
    }
  }
});

client.login('HIER BOT TOKEN EINFÜGEN');
