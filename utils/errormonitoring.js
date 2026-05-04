const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason);
  });
};
