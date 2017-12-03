/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var bot = new builder.UniversalBot(connector);

var savedAddress;
server.post('/api/messages', connector.listen());



bot.dialog('help',  [
  function (session) {
    session.beginDialog('askHome');
  },
  function (session, results) {
    if (results.response.toUpperCase() === "YES") {
      session.endDialog();
    } else {
      session.beginDialog('askBreathe');
    }
  }
]);

bot.dialog('askHome', [
    function (session) {
      session.send("Do you want me to make sure you get home safely?");
      setTimeout(() => {
        session.send("I'll check in on you after a set period of time and if you don't reply to me within a few minutes, I'll message someone to physically check in on you");
      }, 2000);
      setTimeout(() => {
        builder.Prompts.text(session, "Would you like that?");
      }, 3500);
    },
    function (session, results) {
      if (results.response.toUpperCase() === "YES")
          session.beginDialog('getHome');
      else
          session.endDialogWithResult(results);
    }
]);

bot.dialog('getHome', [
  function (session) {
    session.dialogData.alarm = {};
    builder.Prompts.time(session, "When do you want me to check back in with you? (e.g.,'in 5 minutes')");
  },
  function (session, results) {
    session.sent("test1");
    if (results.response) {
        session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
        session.send("s%", builder.EntityRecognizer.resolveTime([results.response]));
        session.dialogData.name = "Are you home?";
    }
    session.sent("test");
    // Return alarm to caller  
    if (session.dialogData.name && session.dialogData.time) {
        session.endDialogWithResult({ 
            response: { name: session.dialogData.name, time: session.dialogData.time } 
        }); 
    } else {
        session.endDialogWithResult({
            resumed: builder.ResumeReason.notCompleted
        });
    }
  }
]);

bot.dialog('askBreathe', [
  function (session) {
    session.send("hi");
  }
]);

bot.dialog('getBreathe', [
  function (session) {
    session.send("hi");
  }
]);

// root dialog
bot.dialog('/', function(session, args) {

  savedAddress = session.message.address;
  if (session.message.text.toUpperCase() === "HI" ||
      session.message.text.toUpperCase() === "HELLO" ||
      session.message.text.toUpperCase() === "SUP" ||
      session.message.text.toUpperCase() === "HEY") {
          session.send("Hi there! What can I do for you?");
  }
  else if (session.message.text.toUpperCase().includes("HOME")) {
      session.beginDialog('getHome');
  }
  else if (session.message.text.toUpperCase().includes("BREATHE")) {
      session.beginDialog('getBreathe');
  }
  else if (session.message.text.toUpperCase().includes("HELP")) {
      session.beginDialog('help');
  } else {
      session.send("Sorry, I'm still learning and I don't know what you mean by that...");
      setTimeout(() => {
        session.send("Try typing 'help' for a list of things that I can do! :D");
      }, 2000);
  }
});