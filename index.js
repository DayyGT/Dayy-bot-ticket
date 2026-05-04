console.log('⏳ Starting Ticket Bot...');

require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const errorMonitoring = require('./utils/errormonitoring');
const statusMonitor = require('./utils/statusMonitor');


// Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ['CHANNEL']
});

client.commands = new Collection();

// Load ticket command
const ticketOrderCommand = require('./commands/admin/ticketorder.js');
client.commands.set(ticketOrderCommand.data.name, ticketOrderCommand);
console.log('✅ /ticketorder loaded');

// Status monitor
statusMonitor(client);

// Ready + deploy + presence
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} ready!`);
  
  // Deploy
  const rest = new REST().setToken(process.env.TOKEN);

  try {
await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [ticketOrderCommand.data.toJSON()] });

    console.log('✅ Command deployed');
  } catch (error) {
    console.error(error);
  }
  
  // Presence
  client.user.setPresence({
    status: 'online',
    activities: [{ name: 'Ticket Support 🎟️', type: ActivityType.Playing }]
  });
});

// Interactions
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }
    require('./events/Ticket').execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({content: 'Error!', ephemeral: true}).catch(() => {});
  }
});

errorMonitoring(client);

client.login(process.env.TOKEN).catch(console.error);


