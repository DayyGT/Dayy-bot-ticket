const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
  client.on('ready', async () => {
    const channel = await client.channels.fetch(config.statusChannelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🟢 Bot Status Online')
      .setDescription('```Bot Sedang Berjalan Sadah Online```')
      .setColor('#00BFFF')
      .setTimestamp();

    channel.send({ embeds: [embed] });
    console.log('✅ Status online sent');
  });

  const sendOfflineStatus = async () => {
    const channel = await client.channels.fetch(config.statusChannelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🔴 Bot Offline')
      .setDescription('```Bot Offline Sadah Ngocok```')
      .setColor('Red')
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  };

  process.on('exit', sendOfflineStatus);
  process.on('SIGINT', sendOfflineStatus);
  process.on('SIGTERM', sendOfflineStatus);
};
