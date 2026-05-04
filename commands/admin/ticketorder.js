const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketorder')
    .setDescription('Menampilkan panel ticket untuk order.'),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: 'Kamu tidak memiliki izin untuk menjalankan perintah ini.',
        ephemeral: true,
      });
    }


    const embed = new EmbedBuilder()
      .setTitle('Ticket Order')
      .setDescription('**🇮🇩 Indonesia**\nKlik Tombol Dibawah Ini Untuk Membuat Tiket Pembelian Maupun Transaksi\n\n**🇬🇧 English**\nClick The Button Below To Create a Purchase Ticket or Transaction')

.setImage('https://cdn.discordapp.com/attachments/988915808723947600/1429975024135045181/tickets.gif?ex=68f81785&is=68f6c605&hm=fccf10450203a2069c26444befc3d8f53ce262779eda1ebdd7a9ce22db69acf4&')


      .setColor('Yellow')

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    









      
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
