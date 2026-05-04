const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
  AttachmentBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ContainerBuilder,
  MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const ticketPath = path.join(__dirname, '../data/tickets.json');


const loadTicketData = () => {
  if (!fs.existsSync(ticketPath)) return {};
  return JSON.parse(fs.readFileSync(ticketPath, 'utf-8'));
};

const saveTicketData = (data) => {
  fs.writeFileSync(ticketPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, guild, user, channel } = interaction;
    const ticketData = loadTicketData();

    if (customId === 'panggil_seller') {
      return interaction.reply({
        content: `**Anda dipanggil, user sedang menunggu!** 
**<@957967397640339456> & <@1006467852938776626>**`,
        ephemeral: false
      });
    }

    if (customId === 'create_ticket') {
      if (ticketData[user.id]) {
        return interaction.reply({ content: '**❌ Kamu Sudah Memiliki Tiket!**', ephemeral: true });
      }

      const ticketName = `ticket-${user.username.toLowerCase()}`;
      const randomId = Math.floor(1000 + Math.random() * 9000);

      const ticketChannel = await guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: process.env.CATEGORY_TICKET_ID,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: process.env.SELLER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });


      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎟️ Ticket Support')
        .setDescription('Hai🤗, Kamu mau beli apa? Silahkan beritahu mau beli apa ya.... Jika Owner belum respon, Panggil saja dengan Meng-Klick dibawah ini')
        .addFields(
          { name: 'ID Ticket', value: `${randomId}`, inline: true },
          { name: 'Dibuat Oleh', value: `<@${user.id}>`, inline: true }
        )
        .setColor('Random');

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('panggil_seller')
          .setLabel('Panggil Admin')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Tutup Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: `<@${user.id}>`, embeds: [ticketEmbed], components: [actionRow] });
      await interaction.reply({ content: `**✅ Ticket Berhasil Dibuat:** ${ticketChannel}`, ephemeral: true });

      ticketData[user.id] = {
        channelId: ticketChannel.id,
        idTicket: randomId,
        userId: user.id
      };
      saveTicketData(ticketData);

      const logChannel = guild.channels.cache.get(process.env.CHANNEL_LOG_TICKET_ID);
      if (logChannel) {

        const openComponents = [
          new ContainerBuilder()
            .setAccentColor(1507327)
            .addSectionComponents(
              new SectionBuilder()
                .setThumbnailAccessory(
                  new ThumbnailBuilder()
                    .setURL(user.displayAvatarURL({ extension: 'png', size: 512 }))
                )
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("# Ticket Opened"),
                  new TextDisplayBuilder().setContent("The following is the newly opened ticket data."),
                ),
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent([
                `**- Name Ticket:** ${ticketChannel.name}`,
                `**- User:** <@${user.id}>`,
                `**- ID Ticket:** ${randomId}`
              ].join("\n")),
            )
        ];

        logChannel.send({
          components: openComponents,
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    if (customId === 'close_ticket') {
      await interaction.reply({ content: '**Menutup Ticket dalam 5 Detik...**', ephemeral: true });

      const ticketOwner = Object.keys(ticketData).find(key => ticketData[key].channelId === channel.id);
      const ticketInfo = ticketData[ticketOwner];

      setTimeout(async () => {
        const messages = await channel.messages.fetch({ limit: 100 });
        const content = messages
          .reverse()
          .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`)
          .join('\n');

        const transcriptFile = new AttachmentBuilder(Buffer.from(content), { name: `${channel.name}-transcript.txt` });

        const owner = await interaction.client.users.fetch(ticketOwner).catch(() => null);
        if (owner) {
          await owner.send({
            content: `📄 Percakapan di Tiket (${channel.name}):`,
            files: [transcriptFile]
          }).catch(() => null);
        }

        const logChannel = guild.channels.cache.get(process.env.CHANNEL_LOG_TICKET_ID);
        if (logChannel) {

          const closeComponents = [
            new ContainerBuilder()
              .setAccentColor(16711715)
              .addSectionComponents(
                new SectionBuilder()
                  .setThumbnailAccessory(
                    new ThumbnailBuilder()
                      .setURL(user.displayAvatarURL({ extension: 'png', size: 512 }))
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Ticket Closed"),
                    new TextDisplayBuilder().setContent("The following is the data for tickets that have been closed."),
                  ),
              )
              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent([
                  `**- Name Ticket:** ${channel.name}`,
                  `**- User:** <@${ticketOwner}>`,
                  `**- Closed:** <@${user.id}>`
                ].join("\n")),
              )
          ];

          logChannel.send({
            components: closeComponents,
            flags: MessageFlags.IsComponentsV2
          });
        }

        delete ticketData[ticketOwner];
        saveTicketData(ticketData);
        await channel.delete().catch(() => null);
      }, 5000);
    }
  }
};

