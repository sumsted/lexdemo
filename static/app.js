
var app = {
    'chatroom' : {},
    'chatbot' : {},
    'init': function(){
        this.chatroomChannel = PUBNUB_CHATROOM_CHANNEL;
        this.chatroom =  new PubNub({ publishKey : PUBNUB_PUBLISH_KEY, subscribeKey : PUBNUB_SUBSCRIBE_KEY});
        // this.chatroom =  new PubNub({ publishKey : 'demo', subscribeKey : 'demo'});
        this.chatroom.addListener({message:this.chatroomListener});
        this.chatroom.subscribe({channels:[this.chatroomChannel]});

        this.chatbotChannel = PUBNUB_CHATBOT_CHANNEL;
        this.chatbot =  new PubNub({ subscribeKey : PUBNUB_SUBSCRIBE_KEY});
        this.chatbot.addListener({message:this.chatbotListener});
        this.chatbot.subscribe({channels:[this.chatbotChannel]});

        $('#message').keyup(this.publishMessage);
    },
    'chatroomListener': function(obj){
        $('#box').append(''+app.formatMessage((''+obj.message).replace( /[<>]/g, '' ))+'<br/>');
        $('#box').scrollTop($('#box')[0].scrollHeight);
    },
    'chatbotListener': function(obj){
        if($('#monitor-slider').val()=='1'){
            $('#bot').append('<pre>'+JSON.stringify(obj.message, null, ' ')+'</pre>');
            $('#bot').scrollTop($('#bot')[0].scrollHeight);
        }
    },
    'publishMessage': function(e){
        if ((e.keyCode || e.charCode) === 13) {
            var name = $('#name').val();
            name = (name=='')?'some-dude':name;
            var sez = $('#message').val();
            sez = (sez=='')?'sez nothing':sez;
            var message = '@'+name+' '+sez;
            app.chatroom.publish({channel: app.chatroomChannel, message: message,x : ($('#message').val(''))});
        }
    },
    'formatMessage': function(message){
        var tokens = message.split(' ');
        var handle = tokens[0];
        tokens.splice(0,1);
        var remaining = tokens.join(' ');
        return "<span class='handle'>"+handle+"</span><span class='message'>"+remaining+"</span>"
    }
};
$(document).ready(app.init());
