var app = {
    'chatroom': {},
    'chatbotlog': {},
    'init': function () {
        this.chatroomChannel = PUBNUB_CHATROOM_CHANNEL;
        this.chatbotChannel = PUBNUB_CHATBOT_CHANNEL;
        this.chatroom = new PubNub({publishKey: PUBNUB_PUBLISH_KEY, subscribeKey: PUBNUB_SUBSCRIBE_KEY});
        this.chatroom.addListener({message: this.chatroomListener});
        this.chatroom.subscribe({channels: [this.chatroomChannel]});

        this.chatbotLogChannel = PUBNUB_CHATBOTLOG_CHANNEL;
        this.chatbotLog = new PubNub({subscribeKey: PUBNUB_SUBSCRIBE_KEY});
        this.chatbotLog.addListener({message: this.chatbotLogListener});
        this.chatbotLog.subscribe({channels: [this.chatbotLogChannel]});

        // $('#message').keyup(this.checkForEnter);
        $('#send-button').click(this.publishMessage);
        $('#sample-select').change(this.sampleSelected);

        this.getHistory();
    },
    'sampleSelected': function (ev, el) {
        var selectedValue = $('#sample-select').val();
        if (selectedValue[0] == '!') {
            $('#message').val(selectedValue);
        } else {
            $('#message').val($('#message').val() + selectedValue);
        }
        $('#sample-select').val('');
        $('#message').focus();
    },
    'chatroomListener': function (obj) {
        if (typeof obj.message === 'string' || obj.message instanceof String) {
            var chatText = '' + app.formatMessage(('' + obj.message).replace(/[<>]/g, ''));
        } else {
            chatText = '' + app.formatMessage(('@' + obj.message['from'] + ' @' + obj.message['user'] + ' ' + obj.message['responseText']).replace(/[<>]/g, ''));
        }
        $('#box').append(chatText);
        $('#box').scrollTop($('#box')[0].scrollHeight);

    },
    'chatbotLogListener': function (obj) {
        if ($('#monitor-slider').val() == '1') {
            $('#bot').append('<pre>' + JSON.stringify(obj.message, null, ' ') + '</pre>');
            $('#bot').scrollTop($('#bot')[0].scrollHeight);
        }
    },
    'checkForEnter': function (e) {
        e.preventDefault();
        if ((e.keyCode || e.charCode) === 13) {
            app.publishMessage(e);
        }
    },
    'publishMessage': function (e) {
        e.preventDefault();
        var name = $('#name').val().replace(/[^A-Z|a-z]/g, '').toLowerCase().slice(0, 10);
        name = (name == '') ? 'stranger' : name;
        var sez = $('#message').val();
        sez = (sez == '') ? 'says nothing' : sez;
        if (sez.length > 2 && sez[0] == '!' && sez[1] != ' ') {
            sez = sez[0] + ' ' + sez.slice(1);
        }
        if (sez[0] == '!') {
            var chatbotRequest = {
                "from": "chatroom",
                "responseChannel": app.chatroomChannel,
                "user": name,
                "requestText": sez.slice(2)
            };
            app.chatroom.publish({channel: app.chatbotChannel, message: chatbotRequest, x: ($('#message').val(''))});
        }
        var message = '@' + name + ' ' + sez;
        app.chatroom.publish({channel: app.chatroomChannel, message: message, x: ($('#message').val(''))});
        return false;
    },
    'formatMessage': function (message) {
        var tokens = message.split(' ');
        var handle = tokens[0];
        var myHandle = '@' + $('#name').val().replace(/[^A-Z|a-z]/g, '').toLowerCase().slice(0, 10);
        var alignment = handle == myHandle ? 'text-right' : 'text-left';
        var today = new Date();
        var hours = today.getHours() % 12;
        hours = hours == 0 ? 12 : hours;
        var messageTime = hours + ':' + ("0" + today.getMinutes()).slice(-2) + ':' + ("0" + today.getSeconds()).slice(-2) + " " + (today.getHours() > 11 ? "PM" : "AM");
        tokens.splice(0, 1);
        var remaining = tokens.join(' ');
        if (handle == myHandle) {
            var bubble = 'me-bubble';
            var bottom = 'me-bottom';
        } else if (remaining.indexOf(myHandle) > -1 && myHandle != '@') {
            bubble = 'fred-bubble';
            bottom = 'fred-bottom';
        } else {
            bubble = 'other-bubble';
            bottom = 'other-bottom'
        }
        return "<div class='bubble-wrapper clearfix'><div class='" + bubble + "'>" + remaining + "</div></div><div class='" + bottom + " clearfix'><div class='pointy-thing-left'></div><div class='pointy-thing-right'></div></div><div class='" + alignment + "'><strong>" + handle + "</strong>  " + messageTime.toLocaleString() + "</div>";
    },
    'getHistory': function () {
        app.chatroom.history(
            {
                channel: app.chatroomChannel,
                reverse: false,
                count: 5
            },
            function (status, response) {
                for (var i = 0; i < response.messages.length; i++) {
                    if (typeof response.messages[i].entry === 'string' || response.messages[i].entry instanceof String) {
                        var chatText = '' + app.formatMessage(('' + response.messages[i].entry).replace(/[<>]/g, ''));
                    } else {
                        chatText = '' + app.formatMessage(('@' + response.messages[i].entry['from'] + ' @' + response.messages[i].entry['user'] + ' ' + response.messages[i].entry['responseText']).replace(/[<>]/g, ''));
                    }
                    $('#box').append(chatText);
                    $('#box').scrollTop($('#box')[0].scrollHeight);
                }
            }
        );
    }
};
$(document).ready(app.init());


















