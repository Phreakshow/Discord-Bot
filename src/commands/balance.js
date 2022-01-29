const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fetch = require("node-fetch");


let currentBalance;
let adress; 

const getWalletBalance = async (adress) => {
    const response = await fetch(
      `https://api.bscscan.com/api?module=account&action=balance&address=${adress}&tag=latest&apikey=U9RTX4K16W6U4BFBYKDX62PDUE27TRUXAT`
    );
    
    const data = await response.json();
    currentBalance = parseFloat(data.result.substr(0, Math.abs(18 - data.result.length)) + "." + data.result.substr(Math.abs(18 - data.result.length)));


    console.log(currentBalance);
	return currentBalance;
  };

//  Bot sends a response on "balance"


module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Replies with current BNB balance!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The wallet adress to be analized')
                .setRequired(true)),
            
    async execute(interaction) {
    	//await interaction.fetchReply().then(reply => adress = reply);
		adress = interaction.options.getString('input');
        currentBalance = await getWalletBalance(adress);
        await interaction.reply({content: `This wallet's balance is ${currentBalance} BNB!`, ephemeral: true});
    },

};