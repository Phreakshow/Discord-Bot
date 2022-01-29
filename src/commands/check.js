const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fetch = require("node-fetch");
var axios = require("axios");
const Headers = require("fetch-headers");
const { google } = require("googleapis");

const check = async () => {
  // google SS auth + read from sheet
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1swe4llo1eyQ0qFxTl_BpLtCXk0vR3iHDGGkGKltW_ow";

  const metadata = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

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

  let tweetId="";

  let statement = [];
  for (let i = 0; i < 2; i++) {
    let name = await getRows.data.values[i + 1][0];
    let userId = await getRows.data.values[i + 1][1];

    let resp = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets`,
      requestOptions
    )
      .then((response) => response.json())
      .catch((error) => console.log("error", error));
    //resp.data[0].text -<---Twitter Resp for later use
    console.log(getRows.data.values[i + 1][0]);

    let action =  resp.data[0].text;
    tweetId = resp.data[0].id;
    console.log(resp);
    statement.push(`${name} has a new TWEET:\n ${action}`);
  }
  return statement; //<-the working thing
};


//--------------------Execution of functions/command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("checks somethinglol!"),

  async execute(interaction) {
    let answer = await check();
    console.log(answer);
    for (let i = 0; i < answer.length; i++) {
      if (i == 0) {
        await interaction.reply(`${answer[i]}`);
      } else {
        await interaction.followUp(`${answer[i]}`);
      }
    }
  },
};
