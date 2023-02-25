// Import libraries and functions
const Discord = require("discord.js");
const {
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const { getVoiceConnection } = require("@discordjs/voice");
require("dotenv").config();

// Scope workarounds
var connection = null;
var player = null;
var subscription = null;
var benLeft = false;

var benChannelId = "948284580190879754";

// Declare client and intents
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"],
});

// Text channel answers
const answers = ["Yes?", "No.", "Ho ho ho!", "Eugh!"];

// Voice channel file names
const files = ["yes", "no", "hohoho", "eugh", "benleft"];

// Admin IDs
// TODO: Admin Commands (maybe replace with role)
const admins = ["445928169350889472", "338075554937044994"];

// Play sound
function playSound(formattedMessage, player) {
  const resource = createAudioResource(`./sounds/${formattedMessage}.mp3`);
  player.play(resource);
}

// Wait a few miliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get random int function
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createPlayer() {
  var channel = client.channels.cache.get("949463557685260389");

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  subscription = connection.subscribe(player);
}

// On bot load run these things
client.on("ready", () => {
  // Join voice channel
  var voiceChannel = client.channels.cache.get("949463557685260389");
  createPlayer(connection, player);

  // Status and activity
  client.user.setStatus("dnd");
  client.user.setActivity("JavaScript tutorials", { type: "WATCHING" });

  // Play ben in VC and send message in channel
  playSound("ben", player);
  client.channels.cache
    .get("948284580190879754")
    .send(":telephone_receiver: Ben.");

  // Log in console that bot has started
  console.log(`Logged in as ${client.user.tag}`);
});
client.on("messageCreate", async (message) => {
  // Ignore invalid input
  if (message.author.bot || message.channel.id != benChannelId) return;

  // Case insensitive from now on
  let formattedMessage = message.content.toLowerCase();

  // Listen for "ben"
  if (formattedMessage.startsWith(`ben`) || formattedMessage.endsWith(`ben`)) {
    // Generate random number from 0-4
    number = getRandomInt(5);

    // If number is not 4 reply normally with sound
    if (number != 4 && benLeft == false) {
      playSound(files[number], player);
      message.reply(answers[number]);

      // If it is 4 play the exit sound, send message and leave
    } else if (number == 4 && benLeft == false) {
      benLeft = true;
      playSound("benleft", player);
      message.reply(":telephone: *hangs up*");
      await sleep(2200);
      connection.destroy();

      // If ben left, join and say Ben.
    } else if (benLeft) {
      createPlayer(connection, player);
      playSound("ben", player);
      message.reply(":telephone_receiver: Ben.");
      benLeft = false;
    }
  }

  // Say in VC
  if (
    formattedMessage.startsWith(`say `) &&
    !formattedMessage.endsWith("ben")
  ) {
    formattedMessage = formattedMessage.slice(4);
    switch (formattedMessage) {
      case "yes":
      case "no":
      case "hohoho":
      case "eugh":
        playSound(formattedMessage, player);
        message.reply(`Saying \`${formattedMessage}\` in VC!`);
        break;
      default:
        message.reply(
          "This isn't a sound! The only sounds are: `yes`, `no`, `hohoho` and `eugh`!"
        );
        break;
    }
  }
});

client.login(process.env.TOKEN);
