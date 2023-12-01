const { Client, Intents } = require('discord.js');
const { spawn } = require('child_process');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const os = require('os');


const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

// Define your commands
const commands = [
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the session')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the session')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('logout')
    .setDescription('Log out')
    .toJSON(),
];

const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', interaction => {
  const currentTime = new Date();
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  if (commandName.toLowerCase() === "lock") {
    spawn('/usr/bin/python3', ['lock.py', 'lock']);
    interaction.reply(`\`\`\`Session Locked at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
  } else if(commandName.toLowerCase() === 'unlock') {
    spawn('/usr/bin/python3', ['lock.py', 'unlock']);
    interaction.reply(`\`\`\`Session unLocked at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
  }else if (commandName.toLowerCase() === "logout") {
    interaction.reply(`\`\`\`Session logged out at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
    spawn('/usr/bin/pkill',['-u', `${os.userInfo().username}`]);
  }
});

client.login(process.env.CLIENT_TOKEN);
