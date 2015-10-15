/**
 * Created by allenbklj on 9/13/15.
 */
$(document).ready(function() {
    var socket = io();
    var chatobj = {};
    var allConnected = [];
    var otherClientId;
    var otherClientSocketId;
    var otherClient;
    var listOfPeopleIStartedChatWith = [];
    var $h1 = $('h1');
    var h1text = $h1.text();
    h1text = "Welcome " + h1text.charAt(0).toUpperCase() + h1text.slice(1);
    $h1.text(h1text);
    var idx = $('#hiddenId').val();
    var namex = $('#hiddenName').val();

    var newTask;
    var newAssigner;
    var newAssigner_id;
    var newAssignee_id;

    socket.emit('store id', {
        id: idx,
        name: namex
    });

    function chatsubmit() {
        for (key in allConnected) {
            var boxId = $(this).closest('.chatBox').find('.chatMessages').attr('box-id');
            if (allConnected[key].id === boxId) {
                otherClientSocketId = allConnected[key].socketId;
                break;
            } else {
                otherClientSocketId = "not found";
            }
        }

        var message = $(this).children('.m').val();
        if (message !== '') {
            chatobj.message = message;
            chatobj.user = $('#hiddenName').val();
            chatobj.user_id = $('#hiddenId').val();
            chatobj.sendToId = otherClientSocketId;
            console.log('sending msg');
            console.log(chatobj);

            if (otherClientId !== "not found")
                socket.emit('chat message', chatobj);

            var $dt = new Date().toString().slice(4, 24);
            var $newElem = $(this).siblings().eq(1).children('.chatMessages');
            var $li1 = $('<li class="ownMsg"></li>');


            $li1.text(message);
            $li1.appendTo($newElem);
            var $li2 = $('<li class="ownInfo"></li>');
            var text = chatobj.user.charAt(0).toUpperCase() + chatobj.user.slice(1) + ". " + $dt;
            $li2.text(text);
            $li2.appendTo($newElem);
            $(this).parent().children('.chatDiv')[0].scrollTop = $(this).parent().children('.chatDiv')[0].scrollHeight;
            $(this).children('.m').val('');
        }

        return false;
    }

    function closeChat() {

        var boxId = $(this).closest('.chatBox').find('.chatMessages').attr('box-id');
        var index = listOfPeopleIStartedChatWith.indexOf(boxId);
        listOfPeopleIStartedChatWith.splice(index, 1);
        $(this).closest('.chatBox').remove();
    }

    function minimizeChat() {
        $(this).closest('.topBorder').siblings().hide();
    }

    function maximizeChat() {
        $(this).closest('.topBorder').siblings().show();
    }

    function createChatBox(text, boxid) {
        var $chatliBox = $('<li class="chatliBox"></li>');
        var $chatBox = $('<div class="chatBox panel"></div>');
        var $topBorder = $('<div class="topBorder"></div>');
        var $topBorderOption = $('<ul class="topBorderOption"></ul>');
        var $chatIcon = $('<li><i style="color:wheat" class="fa fa-whatsapp icon"></i></li>');
        var $userText = $('<li class="userText"></li>');
        $userText.text(text);

        var $minimize = $('<li><i style="color:wheat" class="fa fa-minus minimize"></i></li>');
        var $maximize = $('<li><i style="color:wheat" class="fa fa-paper-plane maximize"></i></li>');
        var $closeChat = $('<li><i style="color:wheat" class="fa fa-times closeChat"></i></li>');

        var $chatDiv = $('<div class="chatDiv"></div>');
        var $chatMessages = $('<ul class="chatMessages"></ul>');
        var $chat = $('<form class="chat"></form>');
        var $m = $('<input class="m" autocomplete="off" placeholder="send message"/>');

        $m.appendTo($chat);
        $chatMessages.appendTo($chatDiv);
        $chatIcon.appendTo($topBorderOption);
        $userText.appendTo($topBorderOption);
        $minimize.appendTo($topBorderOption);
        $maximize.appendTo($topBorderOption);
        $closeChat.appendTo($topBorderOption);
        $topBorderOption.appendTo($topBorder);
        $topBorder.appendTo($chatBox);
        $chatDiv.appendTo($chatBox);
        $chat.appendTo($chatBox);

        $chatMessages.attr('box-id', boxid);

        $chatMessages.on('contextmenu', function (e) {
            e.preventDefault();

            var msgClass = $(e.target).attr('class');
            if (msgClass === "ownMsg" || msgClass === "otherMsg") {
                newAssignee_id = $(this).closest('.chatBox').find('.chatMessages').attr('box-id');
                newAssigner_id = idx;

                var $menu = $('#menu');
                var task = $(e.target).text();
                var assignerName = namex.charAt(0).toUpperCase() + namex.slice(1);
                var assigneeName = text.charAt(0).toUpperCase() + text.slice(1);

                newTask = task;
                newAssigner = assignerName;

                $('#assignee').val(assigneeName);
                $('#assigner').val(assignerName);
                $('#task').val(task);

                $menu.text('Assign Task');
                $menu.css({
                    position: 'absolute',
                    top: e.pageY,
                    left: e.pageX
                });
                $menu.show();

                $menu.on('click', function () {
                    $menu.hide();
                    $('#dialog').show();
                });
            }
        });

        $chatBox.appendTo($chatliBox);
        $chatliBox.appendTo($('#chatBoxContainer'));

        $closeChat.on('click', closeChat);
        $minimize.on('click', minimizeChat);
        $maximize.on('click', maximizeChat);
        otherClient = text;
        $chat.submit(chatsubmit);
        return $chatBox;
    }


    $(document).on('mousedown', function (e) {
        if (e.target.id !== 'menu') {
            $('#menu').hide();
        }
    });

    $('a.close').on('click', function () {
        $('#dialog').fadeOut('100');
        var task = $('#task').val('');
    });
    $('#submittask').on('click', function (e) {
        e.preventDefault();
        var data = {
            description: newTask,
            createdBy: newAssigner_id,
            assigner_id: newAssigner_id,
            assignee_id: newAssignee_id
        };
        console.log(data);
        $.post('/assign', data).then(function (result) {
            $('#dialog').hide();
            alert(result.message);
        }, function (err) {
            console.log(err);
        });

        newTask = "";
        newAssigner = "";
        newAssignee_id = "";
        newAssigner_id = "";
    });

    function sendMessage(e) {
        var name = $(e.target).text();
        var boxid =  $(e.target).attr('user-id');
        if(listOfPeopleIStartedChatWith.indexOf(boxid) === -1){
            listOfPeopleIStartedChatWith.push(boxid);
            var $chatBox = createChatBox(name, boxid);
        }
    }
    socket.on('chat message', function(msg){
        if(listOfPeopleIStartedChatWith.indexOf(msg.user_id) ===-1){
            listOfPeopleIStartedChatWith.push(msg.user_id);
            var text = msg.user.charAt(0).toUpperCase() + msg.user.slice(1);
            var $chatBox = createChatBox(text , msg.user_id);


            var text = msg.user.charAt(0).toUpperCase() + msg.user.slice(1);
            var $li1 = $('<li class="otherMsg"></li>');
            $li1.text(msg.message);
            var $newElem = $chatBox.children('.chatDiv').children('.chatMessages');
            $li1.appendTo($newElem);

            var $dt = new Date().toString().slice(4,24);
            var $li2 = $('<li class="otherInfo"></li>');
            var text = msg.user.charAt(0).toUpperCase() + msg.user.slice(1) + ". " + $dt;
            $li2.text(text);
            $li2.appendTo($newElem);
            $(this).closest('.chatDiv').scrollTop = $(this).closest('.chatDiv').scrollHeight;
        }else{
            $chatBox = $("ul[box-id='" + msg.user_id +"']")[0];
            console.log('chat message : ' +msg);
            var text = msg.user.charAt(0).toUpperCase() + msg.user.slice(1);
            var $li1 = $('<li class="otherMsg"></li>');
            $li1.text(msg.message);
            // var $newElem = $chatBox.children('.chatDiv').children('.chatMessages');
            $li1.appendTo($chatBox);

            var $dt = new Date().toString().slice(4,24);
            var $li2 = $('<li class="otherInfo"></li>');
            var text = msg.user.charAt(0).toUpperCase() + msg.user.slice(1) + ". " + $dt;
            $li2.text(text);
            $li2.appendTo($chatBox);
            $chatBox.closest('.chatDiv').scrollTop = $chatBox.closest('.chatDiv').scrollHeight;
        }
    });

    socket.on('your id', function(msg){
        selfid = msg;
        console.log('self id is : ' +selfid);
    });

    socket.on('all ids', function(msg){
        console.log('msg is :');
        console.log(msg);
        createList(msg);
    });

    function createList(msg){
        allConnected = msg;
        var $ul = $('#list');
        $ul.empty();
        for(key in allConnected){
            if(allConnected[key].id !== idx){
                var $li = $('<li></li>');
                $li.attr('user-id', allConnected[key].id);
                $li.addClass('online');
                var name = allConnected[key].name;
                $li.text(name.charAt(0).toUpperCase() + name.slice(1));
                $li.appendTo($ul);
            }
        }
    }

    socket.on('user disconnected',function(msg){
        console.log('disconnected');
        createList(msg);
    });

    $('#list').on('click', sendMessage);
    $('.closeChat').on('click', closeChat);
    $('.minimize').on('click', minimizeChat);
    $('.maximize').on('click', maximizeChat);
});
