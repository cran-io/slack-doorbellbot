var Slack = require('slack-client');

var token = process.env.SLACK_TOKEN;

var slack = new Slack(token, true, true);

slack.on('open', function () {
  var channels = Object.keys(slack.channels)
    .map(function (k) { return slack.channels[k]; })
    .filter(function (c) { return c.is_member; })
    .map(function (c) { return c.name; });

  var groups = Object.keys(slack.groups)
    .map(function (k) { return slack.groups[k]; })
    .filter(function (g) { return g.is_open && !g.is_archived; })
    .map(function (g) { return g.name; });

  console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

  if (channels.length > 0) {
    console.log('You are in: ' + channels.join(', '));
  } else {
    console.log('You are not in any channels.');
  }

  if (groups.length > 0) {
    console.log('As well as: ' + groups.join(', '));
  }
});

slack.on('message', function(message) {
  var channel = slack.getChannelGroupOrDMByID(message.channel);

  if (message.type === 'message') {
    if (channel.name == 'random' && message.text == 'timbre') {
      var onlineUsers = getOnlineHumansForChannel(channel).map(function(u) { return u.id });
      var selectedUserId = onlineUsers[Math.floor(Math.random()*onlineUsers.length)];
      var selectedUser = slack.getUserByID(selectedUserId);
      channel.send("@" + selectedUser.name + " te toca abrir la puerta!! :D");
    }
  }
});

slack.login();

var getOnlineHumansForChannel = function(channel) {
  if (!channel) return [];

  return (channel.members || [])
    .map(function(id) { return slack.users[id]; })
    .filter(function(u) { return !!u && !u.is_bot && u.presence === 'active'; });
}
