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

var benChannelId = "948284580190879754";

// Declare client and intents
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"],
});

// Text channel answers
const answers = ["Yes?", "No.", "Ho ho ho!", "Eugh!"];

// Voice channel file names
const files = ["yes", "no", "hohoho", "eugh"];

// Get random int function
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// On bot load run these things
client.on("ready", () => {
  // Join voice channel
  var voiceChannel = client.channels.cache.get("949463557685260389");
  connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  // Status and activity
  client.user.setStatus("dnd");
  client.user.setActivity("JavaScript tutorials", { type: "WATCHING" });

  // Music stuff
  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  subscription = connection.subscribe(player);

  // Play ben in VC and send message in channel
  const resource = createAudioResource("./sounds/ben.mp3");
  player.play(resource);
  client.channels.cache.get("948284580190879754").send("Ben. :telephone:");

  // Log in console that bot has started
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  // Ignore invalid input
  if (message.author.bot || message.channel.id != benChannelId) return;

  // Case insensitive from now on
  let formattedMessage = message.content.toLowerCase();

  // Listen for "ben"
  if (formattedMessage.startsWith(`ben`) || formattedMessage.endsWith(`ben`)) {
    // Get random number from 0-3
    number = getRandomInt(3);
    // Load file
    const resource = createAudioResource(
      `./sounds/${files[number]}.mp3`
    );
    // Play file and send message
    player.play(resource);
    message.reply(answers[number]);
  }
});

client.login(process.env.TOKEN);