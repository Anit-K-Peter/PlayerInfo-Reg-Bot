const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  async execute(interaction) {
    const pingEmbed = new EmbedBuilder()
      .setTitle('Ping')
      .setDescription('Checking latency...')
      .setColor(0x00ff00);

    const start = Date.now();
    await interaction.deferReply();
    const end = Date.now();

    const latency = end - start;
    const apiLatency = interaction.client.ws.ping;

    pingEmbed.setDescription(`Latency: ${latency}ms\nAPI Latency: ${apiLatency}ms`);

    if (interaction.client.shard) {
      const shardLatency = interaction.client.shard.latency;
      pingEmbed.addFields({ name: 'Shard Latency', value: `${shardLatency}ms` });
    }

    await interaction.followUp({ embeds: [pingEmbed] });
  }
};