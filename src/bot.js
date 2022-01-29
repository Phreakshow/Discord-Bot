require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fetch = require("node-fetch");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const Headers = require("fetch-headers");
const { google } = require("googleapis");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    console.log("Executing command: " + interaction.commandName);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

//-------------------------CONSOLE LOG ON STARTUP --------------------------------------------------------------------------------

client.on("ready", () => {
  console.log(`${client.user.username} is ready to work!`);
});

//----------------------------GET WALLET BUTTONS--------------------------------------------------------------------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select")
        .setPlaceholder("Nothing selected")
        .addOptions([
          {
            label: "Select me",
            description: "This is a description",
            value: "first_option",
          },
          {
            label: "You can select me too",
            description: "This is also a description",
            value: "second_option",
          },
        ])
    );

    await interaction.reply({ content: "Pong!", components: [row] });
  }
});
//---------------------------------automatic checkign and sending-----------------------------------------------------

setInterval(() => {
  console.log("doing a cycle");

  async function check() {
    // google SS auth + read from sheet
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1swe4llo1eyQ0qFxTl_BpLtCXk0vR3iHDGGkGKltW_ow";

    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Sheet1",
    });

    //-------------Write to sheet

    //-------------------Twitter Call-------------

    //------------------Loop thru the database to find last like------------

    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer AAAAAAAAAAAAAAAAAAAAAMzeVAEAAAAAxhc2rpmChlYJPh28TqAMrwr7S3U%3DTvkDwar5mji86FsBYpuW1B4aESHQMorhCLSj1YoYHIlUf3obA6"
    );
    myHeaders.append(
      "Cookie",
      'guest_id=v1%3A163545685754354728; personalization_id="v1_7LvSrM0Oh1zN86jJavJXQA=="'
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    //--------------Do a cycle and add new likes----HAVE TO ADD FILTERING
    let tweetId = "";
    let statement = [];
    for (let i = 0; i < 2; i++) {
        if(i == 1){
          break;
        }

      let name = await getRows.data.values[i + 1][0];
      let userId = await getRows.data.values[i + 1][1];
      let lastTweet = await getRows.data.values[i + 1][2];

      let resp = await fetch(
        `https://api.twitter.com/2/users/${userId}/liked_tweets?max_results=5`,
        requestOptions
      )
        .then((response) => response.json())
        .catch((error) => console.log("error", error));
      //resp.data[0].text -<---Twitter Resp for later use
      console.log(getRows.data.values[i + 1][0]);

      let action = resp.data[0].text;
      tweetId = resp.data[0].id;
      console.log(tweetId);

      if (tweetId !== lastTweet) {
        statement.push(`${name} just liked a tweet:\n ${action}`);
        if (i == 0) {
          await googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: "Sheet1!A1:F5",
            valueInputOption: "RAW",
            resource: {
              values: [
                // values takes array for rows, each row is an array
                [
                  "Name",
                  "ID",
                  "Last Like ID",
                  "Last Tweet ID",
                  "Last Retweet ID",
                  "Last Reply ID",
                ],
                [
                  "Elon Musk",
                  "44196397",
                  tweetId,
                  "Random Value",
                  "Random Value",
                  "Random Value",
                ],
                [
                  "Crypto Messiah",
                  "766578266",
                  null,
                  "Random Value",
                  "Random Value",
                  "Random Value",
                ],
              ],
            },
          });
        } else {
          await googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: "Sheet1!A1:F5",
            valueInputOption: "RAW",
            resource: {
              values: [
                // values takes array for rows, each row is an array
                [
                  "Name",
                  "ID",
                  "Last Like ID",
                  "Last Tweet ID",
                  "Last Retweet ID",
                  "Last Reply ID",
                ],
                [
                  "Elon Musk",
                  "44196397",
                  null,
                  "Random Value",
                  "Random Value",
                  "Random Value",
                ],
                [
                  "Crypto Messiah",
                  "766578266",
                  tweetId,
                  "Random Value",
                  "Random Value",
                  "Random Value",
                ],
              ],
            },
          });
        }
      }
    }

    for (let i = 0; i < 2; i++) {
      if(i ==1) break;
      let name = await getRows.data.values[i + 1][0];
      let userId = await getRows.data.values[i + 1][1];
      let lastTweet = await getRows.data.values[i + 1][3];

      let resp = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=10`,
        requestOptions
      )
        .then((response) => response.json())
        .catch((error) => console.log("error", error));
      //resp.data[0].text -<---Twitter Resp for later use
      console.log(getRows.data.values[i + 1][0]);

      let action = resp.data[0].text;
      tweetId = resp.data[0].id;
      console.log(tweetId);

      if (tweetId !== lastTweet) {
        statement.push(`${name} just TWEETED:\n https://twitter.com/elonmusk/status/${tweetId}`);
        if (i == 0) {
          await googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: "Sheet1!A1:F5",
            valueInputOption: "RAW",
            resource: {
              values: [
                // values takes array for rows, each row is an array
                [
                  "Name",
                  "ID",
                  "Last Like ID",
                  "Last Tweet ID",
                  "Last Retweet ID",
                  "Last Reply ID",
                ],
                [
                  "Elon Musk",
                  "44196397",
                  null,
                  tweetId,
                  "Random Value",
                  "Random Value",
                ],
                [
                  "Crypto Messiah",
                  "766578266",
                  null,
                  null,
                  "Random Value",
                  "Random Value",
                ],
              ],
            },
          });
        } else {
          await googleSheets.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: "Sheet1!A1:F5",
            valueInputOption: "RAW",
            resource: {
              values: [
                // values takes array for rows, each row is an array
                [
                  "Name",
                  "ID",
                  "Last Like ID",
                  "Last Tweet ID",
                  "Last Retweet ID",
                  "Last Reply ID",
                ],
                [
                  "Elon Musk",
                  "44196397",
                  null,
                  null,
                  "Random Value",
                  "Random Value",
                ],
                [
                  "Crypto Messiah",
                  "766578266",
                  null,
                  tweetId,
                  "Random Value",
                  "Random Value",
                ],
              ],
            },
          });
        }
      }
    }




    return statement; //<-the working thing
  }

  async function printer() {
    let checked = await check();
    console.log(checked[0]);
    if (checked[0] !== undefined) {
      for (let i = 0; i < checked.length; i++) {
        client.channels.cache.get("904147949427241010").send(`${checked[i]}`);
        client.channels.cache.get("844236629522907203").send(`${checked[i]}`);
      }
    }
  }

  printer();
}, 60000);

//------------------------------------------------------------code to be used------

//function to add two numbers together

