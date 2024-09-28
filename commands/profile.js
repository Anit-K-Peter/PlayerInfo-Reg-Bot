const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View a player\'s profile')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the player to view')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const players = require('../data/players.js');

    const exactMatch = players.find(player => player.realName.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      const avatarUrl = interaction.client.users.cache.get(exactMatch.discordId).displayAvatarURL();
      const profileEmbed = new EmbedBuilder()
        .setTitle(`Profile of ${exactMatch.realName}`)
        .setDescription(`Here is the profile of ${exactMatch.realName}`)
        .setThumbnail(avatarUrl)
        .addFields(
          { name: "Discord ID", value: exactMatch.discordId, inline: true },
          { name: "Discord Tag", value: exactMatch.discordTag, inline: true },
          { name: "Age", value: exactMatch.age, inline: true },
          { name: "Date of Birth", value: exactMatch.dateOfBirth, inline: true },
          { name: "Phone Number", value: exactMatch.phoneNumber, inline: true },
          { name: "Address", value: exactMatch.address, inline: true },
          { name: "Religion", value: exactMatch.religion, inline: true },
          { name: "Occupation", value: exactMatch.occupation, inline: true },
          {
            name: "Private Account",
            value: exactMatch.private ? "Yes" : "No",
            inline: true,
          }
        )
        .setColor("#00FF00");

      await interaction.reply({ embeds: [profileEmbed] });
      return;
    }

    const partialMatch = players.find(player => {
      const playerNameWords = player.realName.toLowerCase().split(' ');
      const searchWords = name.toLowerCase().split(' ');
      return searchWords.every(word => playerNameWords.includes(word));
    });

    if (partialMatch) {
      const avatarUrl = interaction.client.users.cache.get(partialMatch.discordId).displayAvatarURL();
      const profileEmbed = new EmbedBuilder()
        .setTitle(`Profile of ${partialMatch.realName}`)
        .setDescription(`Here is the profile of ${partialMatch.realName}`)
        .setThumbnail(avatarUrl)
        .addFields(
          { name: "Discord ID", value: partialMatch.discordId, inline: true },
          { name: "Discord Tag", value: partialMatch.discordTag, inline: true },
          { name: "Age", value: partialMatch.age, inline: true },
          { name: "Date of Birth", value: partialMatch.dateOfBirth, inline: true },
          { name: "Phone Number", value: partialMatch.phoneNumber, inline: true },
          { name: "Address", value: partialMatch.address, inline: true },
          { name: "Religion", value: partialMatch.religion, inline: true },
          { name: "Occupation", value: partialMatch.occupation, inline: true },
          {
            name: "Private Account",
            value: partialMatch.private ? "Yes" : "No",
            inline: true,
          }
        )
        .setColor("#00FF00");

      await interaction.reply({ embeds: [profileEmbed] });
      return;
    }

    const matchingPlayers = players.filter(player => {
      const playerNameWords = player.realName.toLowerCase().split(' ');
      const searchWords = name.toLowerCase().split(' ');
      return searchWords.some(word => playerNameWords.includes(word));
    });

    if (matchingPlayers.length > 0) {
      const listEmbed = new EmbedBuilder()
        .setTitle(`No exact match found, but here are some matching names:`)
        .setDescription(`Try searching for one of these names:`);

      matchingPlayers.forEach(player => {
        listEmbed.addFields(
          { name: player.realName, value: `[Search for ${player.realName}](https://example.com/profile/${player.realName})`, inline: true }
        );
      });

      await interaction.reply({ embeds: [listEmbed] });
      return;
    }

    const similarPlayers = players.filter(player => {
      const similarity = similarityRatio(name.toLowerCase(), player.realName.toLowerCase());
      return similarity > 0.5;
    });

    if (similarPlayers.length > 0) {
      const listEmbed = new EmbedBuilder()
        .setTitle(`No player found with the name ${name}, but here are some similar names:`)
        . setDescription(`Try searching for one of these names:`);

      similarPlayers.forEach(player => {
        listEmbed.addFields(
          { name: player.realName, value: `There is an found : ${player.realName}, is that right? or not?`, inline: true }
        );
      });

      await interaction.reply({ embeds: [listEmbed] });
      return;
    }

    await interaction.reply({
      content: `No player found with the name ${name}`,
      ephemeral: true,
    });
  },
};

function similarityRatio(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = Array(len1 + 1).fill(0).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) {
    for (let j = 0; j <= len2; j++) {
      if (i === 0 || j === 0) {
        dp[i][j] = 0;
      } else if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = dp[len1][len2];
  return (2 * lcs) / (len1 + len2);
}