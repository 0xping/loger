const { Client, Intents } = require('discord.js');
const { spawn } = require('child_process');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const os = require('os');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const commands = [
  {
    name: 'lock',
    description: 'Lock the session',
  },
  {
    name: 'unlock',
    description: 'Unlock the session',
  },
  {
    name: 'logout',
    description: 'Log out',
  },
  {
    name: 'state',
    description: 'Get lock screen status',
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.CLIENT_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error);
  }
})();

client.on('interactionCreate', async interaction => {
  const currentTime = new Date();
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  try {
    switch (commandName.toLowerCase()) {
      case 'lock':
        spawn('/usr/bin/python3', ['lock.py', 'lock']);
        interaction.reply(`\`\`\`Session Locked at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
        break;

      case 'unlock':
        spawn('/usr/bin/python3', ['lock.py', 'unlock']);
        interaction.reply(`\`\`\`Session Unlocked at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
        break;

      case 'logout':
        interaction.reply(`\`\`\`Session logged out at ${currentTime.getHours()}:${currentTime.getMinutes()}\`\`\``);
        spawn('/usr/bin/pkill', ['-u', `${os.userInfo().username}`]);
        break;

      case 'state':
        const pyProcess = spawn('python3', ['lock.py', 'islocked']);
        let result = '';

        pyProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pyProcess.on('close', (code) => {
          if (code === 0) {
            const isLocked = result.trim() === 'True';
            interaction.reply(`\`\`\`Session is ${isLocked ? 'locked' : 'unlocked'}\`\`\``);
          } else {
            console.error(`Error executing 'state' command. Exit code: ${code}`);
          }
        });
        break;

      default:
        console.error(`Unknown command: ${commandName}`);
    }
  } catch (error) {
    console.error('Error processing command:', error);
  }
});

client.login(process.env.CLIENT_TOKEN);
