const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register as a player')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Your real name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('age')
        .setDescription('Your age')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('dateofbirth')
        .setDescription('Your date of birth')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('phonenumber')
        .setDescription('Your phone number')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('hidephonenumber')
        .setDescription('Hide your phone number? (Yes/No)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Where you live?')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('religion')
        .setDescription('Which religion are you?')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('occupation')
        .setDescription('What are you studying or unemployed?')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('private')
        .setDescription('Private account? (Yes/No)')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const age = interaction.options.getString('age');
    const dateOfBirth = interaction.options.getString('dateofbirth');
    const phoneNumber = interaction.options.getString('phonenumber');
    const hidePhoneNumber = interaction.options.getString('hidephonenumber');
    const address = interaction.options.getString('address');
    const religion = interaction.options.getString('religion');
    const occupation = interaction.options.getString('occupation');
    const isPrivate = interaction.options.getString('private');

    let phoneNumberValue = phoneNumber;
    if (hidePhoneNumber.toLowerCase() === "yes") {
      phoneNumberValue = "Hidden";
    }

    const player = {
      realName: name,
      discordId: interaction.user.id,
      discordTag: interaction.user.tag,
      age: age,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumberValue,
      address: address,
      religion: religion,
      occupation: occupation,
      private: isPrivate.toLowerCase() === "yes",
    };

    let players = require('../data/players.js');

    // Check if the user is already created an account
    const existingPlayer = players.find((p) => p.discordId === interaction.user.id);
    if (existingPlayer) {
      await interaction.reply({
        content: "You already have an account!",
        ephemeral: true,
      });
      return;
    }

    players.push(player);
    fs.writeFileSync(
      "./data/players.js",
      `module.exports = ${JSON.stringify(players, null, 4)};`
    );

    await interaction.reply({
      content: "Player registered successfully!",
      ephemeral: true,
    });

    const channelId = config.registrationChannelId;
    const channel = await interaction.client.channels.fetch(channelId);

    if (channel) {
      const registerEmbed = new EmbedBuilder()
        .setTitle("New Player Registration")
        .setDescription("A new player has registered!")
        .addFields(
          { name: "Real Name", value: player.realName, inline: true },
          { name: "Discord ID", value: player.discordId, inline: true },
          { name: "Discord Tag", value: player.discordTag, inline: true },
          { name: "Age", value: player.age, inline: true },
          { name: "Date of Birth", value: player.dateOfBirth, inline: true },
          { name: "Phone Number", value: player.phoneNumber, inline: true },
          { name: "Address", value: player.address, inline: true },
          { name: "Religion", value: player.religion, inline: true },
          { name: "Occupation", value: player.occupation, inline: true },
          {
            name: "Private Account",
            value: player.private ? "Yes" : "No",
            inline: true,
          }
        )
        .setColor("#00FF00");

      await channel.send({ embeds: [registerEmbed] });
    } else {
      console.error(`Channel with ID ${channelId} not found.`);
    }
  },
};