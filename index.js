// const server_addr = '10.28.156.99'
const server_addr = '10.147.19.5'
// const server_addr = '10.147.17.162'
const server_port = '5659'
var   server_url = 'http://' + server_addr + ':' + server_port
var   ter = 100
var cd = {
        'beat' : 0,
        'chat' : 0,
        'info' : 0,
        'others' : 0,
    }
var beat_fail = 0
var player_id = 0, play_id = 0, playing = 0
var chat_id = 0

var c = document.getElementById("canva")
var cxt = c.getContext("2d")
cxt.fillStyle = "#eeaa22"

var sdot = [0, 0], action = 'road', dot_cnt = 0
var catan_map = []


$(() => { 
    $('#nick').val('DY')
    $('#addr').val(server_addr)
    $('#port').val(server_port)
    // $('#type').val(0)
    // setTimeout(draw_map, 100)

    $('#link').click(()=>{
        // player_type = $('#type').val()
        server_url = 'http://' + $('#addr').val() + ':' + $('#port').val()
        send({
                'cmd' : 'reg',
                'name' : $('#nick').val(),
            }, res=>{
                $('#info0').text('成功连接')
                player_id = res.uid
                beat_fail = 0
            })
    })

    $('#speak').click(()=>{
        if($('#speech').val().length==0){
            $('#info2').text('消息不能为空！')
            return
        }

        send({
            'cmd' : 'say',
            'uid' : player_id,
            'cont' : $('#speech').val(),
        }, res=>{})
        $('#speech').val('')
    })


    $('#ready').click(()=>{
        send({
            'cmd' : 'map',
        }, res=>{
            catan_map = res.map
            draw_map(catan_map)
        })
    })

    // hot keys
    $(window).on('keypress', function(e) {
        if (e.keyCode ===13) $('#speak').trigger('click')
    })

    setInterval(god, ter)
})


//************************************************************* 
send = (data, callback)=>{
    $.post(server_url, JSON.stringify(data), (res)=>{
        callback(res)
    })
}

select_dot = (str) => {
    let dot = str.split('_')
    sdot[dot_cnt] = [Number(dot[0]), Number(dot[1])]
    if(action=='road'){
        if(dot_cnt == 1) console.log(sdot[0], sdot[1], is_road(sdot[0], sdot[1]))
        dot_cnt = (dot_cnt + 1) & 1
    }
}

select_center = (str) => {
    return
}

cd_run = (func, k, t) =>{
    if (cd[k]>=t){
        cd[k] = 0
        func()
    }
}

heart_beat = ()=>{
    beat_fail += 1
    send({'cmd' : 'beat', 'uid' : player_id}, res=>{
        if(res.res=='ok'){
            // $('#info0').text('成功连接')
            beat_fail = 0
        }else{
            $('#info0').text('连接失败')
            player_id = 0
            player_type = 0
        }
    })
    if(beat_fail>1){
        $('#info0').text('连接失败')
    }
}

ask_chat = ()=>{
    send({'cmd' : 'ask_chat', 'from' : chat_id}, res=>{
        if(res.n>0){
            for (i in res.data) {
                let cont = res.data[i][0] + ': ' + res.data[i][1]  
                cont = '<div class="chat_box">' + cont + '</div>'              
                $('#chat_board').html($('#chat_board').html() + cont)
            }
            chat_id += res.n
            $('#chat_board').scrollTop(999999)
        }
    })
}

ask_others = ()=>{
    send({'cmd' : 'others', 'uid' : player_id}, res=>{
        if(res.n>0){
            $('#others-list').html(res.user.join(''))
        }
    })
}

ask_info = () =>{
    send({'cmd' : 'info', 'uid' : player_id}, res=>{
        playing = res.playing
        if (playing){
            $('#info2').text('游戏已开始')
        } else{
            $('#info2').text('游戏未开始')
        }

        // user info
        // $('#online-user').text(res.users)
        // $('#credit').text(res.coin)

        // new game
        // if (res.play_id != play_id){
        //     play_id = res.play_id
        //     if (player_id == res.painter) {
        //         player_type = 1
        //         $('#info0').text('你是画家')
        //         $('#info1').text('题目: ' + res.answer)
        //     }else{
        //         player_type = 0
        //         $('#info0').text('你是猜测者')
        //         $('#info1').text('猜一个成语')
        //     }
        // }

    })
}

god = ()=>{
    for(i in cd) cd[i] += ter 

    // whether alive
    if(player_id==0 || beat_fail>1) return

    // heart_beat()
    cd_run(heart_beat, 'beat', 2000)
    
    // work
    cd_run(ask_chat, 'chat', 500)
    cd_run(ask_others, 'others', 1000)
    // ask_info()

}


