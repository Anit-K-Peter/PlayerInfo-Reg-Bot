const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('View a list of players'),
  async execute(interaction) {
    const players = require('../data/players.js');
    const pageSize = 5;
    let currentPage = 1;

    let paginatedPlayers = players.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const listEmbed = new EmbedBuilder()
      .setTitle(`Players (Page ${currentPage})`)
      .setDescription(`Here is the list of players:`);

    paginatedPlayers.forEach((player, index) => {
      listEmbed.addFields(
        { name: `${index + 1}. ${player.realName}`, value: `Discord ID: ${player.discordId}`, inline: true }
      );
    });

    let actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev-page')
          .setLabel('Previous Page')
          .setStyle('Primary')
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId('next-page')
          .setLabel('Next Page')
          .setStyle('Primary')
          .setDisabled(currentPage * pageSize >= players.length)
      );

    let message = await interaction.reply({ embeds: [listEmbed], components: [actionRow] });

    const filter = (interaction) => interaction.customId === 'prev-page' || interaction.customId === 'next-page';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'prev-page') {
        currentPage--;
      } else if (interaction.customId === 'next-page') {
        currentPage++;
      }

      paginatedPlayers = players.slice((currentPage - 1) * pageSize, currentPage * pageSize);

      const listEmbed = new EmbedBuilder()
        .setTitle(`Players (Page ${currentPage})`)
        .setDescription(`Here is the list of players:`);

      paginatedPlayers.forEach((player, index) => {
        listEmbed.addFields(
          { name: `${index + 1}. ${player.realName}`, value: `Discord: <${player.discordId}>`, inline: true }
        );
      });

      actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev-page')
            .setLabel('Previous Page')
            .setStyle('Primary')
            .setDisabled(currentPage === 1),
          new ButtonBuilder()
            .setCustomId('next-page')
            .setLabel('Next Page')
            .setStyle('Primary')
            .setDisabled(currentPage * pageSize >= players.length)
        );

      await message.edit({ embeds: [listEmbed], components: [actionRow] });
    });

    collector.on('end', () => {
      console.log('Collector ended');
    });
  },
};