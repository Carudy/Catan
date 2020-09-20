var origin_width = 173.20508075689, origin_height = 200.0
var bili = 0.75
var img_width = origin_width * bili, img_height = origin_height * bili
var ox = 230, oy = 25
var sx = [], sy = [oy, 0, 0, 0, 0]
var dot_pos = {}, col = [0, 3, 4, 5, 4, 3]
var offset = $('canvas').offset()
offset.top  -= 10
offset.left -= 10

draw_img = (c, x, y) =>{
    cxt.drawImage($('#' + c)[0], x, y, img_width, img_height)
}

hex_center = (a, b) => {
    let x = sx[a] + b * img_width, y = sy[a]
    return [x + img_width *0.5, y + img_height *0.5]
}

hex_dot_pos = (a, b) => {
    a -= 1
    b -= 1
    let x = sx[a] + b * img_width, y = sy[a]
    tp = [x + img_width * 0.5, y]
    l1 = [x, y + img_height * 0.25]
    l2 = [x, y + img_height * 0.75]
    r1 = [x + img_width, y + img_height * 0.25]
    r2 = [x + img_width, y + img_height * 0.75]
    bt = [x + img_width * 0.5, y + img_height]
    return [tp, l1, l2, r1, r2, bt]
}

hex_dot = (a, b) => {
    tp  = [2*a-1 , b + (a>3?1:0)]
    l1  = [2*a   , tp[1] - (a>3?1:0)]
    l2  = [2*a+1 , l1[1]]
    r1  = [2*a   , l1[1] + 1]
    r2  = [2*a+1 , l1[1] + 1]
    bt  = [2*a+2 , tp[1] + (a<3?1:(a>3?-1:0))]

    return [tp, l1, l2, r1, r2, bt]
}

cal_dot_pos = () => {
    for(let a=1; a<=5; ++a){
        for(let b=1; b<=col[a]; ++b){
            let cos = hex_dot(a, b)
            let poses = hex_dot_pos(a, b)
            for(let i in cos){
                let key = cos[i].join('_')
                if (key == '8_6') console.log(a, b)
                if (! (key in dot_pos)) dot_pos[key] = poses[i]
            }
        }
    }
}

set_map = () => {
    sx = [ox, ox - 0.5 * img_width, ox - img_width, ox - 0.5 * img_width, ox]
    for(let i=1; i<5; ++i) sy[i] = sy[i-1] + img_height * 0.75
}

draw_hex_dot = (a, b) => {
    for (let i of hex_dot_pos(a, b)){
        cxt.beginPath()
        cxt.arc(i[0], i[1], 5, 0, Math.PI*2);
        cxt.closePath()
        cxt.fill()
    }
}

draw_hex_center = (a, b) =>{
    c = hex_center(a, b)
    cxt.beginPath()
    cxt.arc(c[0], c[1], 25, 0, Math.PI*2);
    cxt.closePath()
    cxt.fill()
    console.log(c)
}

add_point_btn = () => {
    for(let i in dot_pos) {
        if(!Boolean($('#' + i)[0])){
            $('#road').append('<button onclick="select_dot(\'' + i + '\')" class="dot" id="' + i + '"> </button>')
            $('#' + i).offset({'top' : offset.top + dot_pos[i][1], 'left' : offset.left + dot_pos[i][0]})
        }
    }
}

add_number_circle = (mp) => {
    $('#number').html('')
    for(let i of mp){
        let cor = n2cor(i[0])
        let c = hex_center(cor[0]-1, cor[1]-1)
        if(!Boolean($('#c' + i[0])[0])){
            $('#number').append('<button onclick="select_center(\'' + i[0] + '\')" class="cc" id="c' + i[0] + '">' + i[2] + ' </button>')
            $('#c' + i[0]).offset({'top' : offset.top + c[1] - 15, 'left' : offset.left + c[0] - 15})
        }
    }
}

is_road = (a, b) => {
    if(a[0]==b[0]) return false
    if(a[0]>b[0]) return is_road(b, a)
    if(a[0]+1 != b[0]) return false
    if((a[0]&1) == 0)return a[1] == b[1]
    if(a[0]<6) return a[1]==b[1] || b[1]==a[1]+1
    return a[1]==b[1] || a[1]==b[1]+1
}

n2cor = (n)=>{
    if (n<=3) return [1, n]
    if (n<=7) return [2, n-3]
    if (n<=12) return [3, n-7]
    if (n<=16) return [4, n-12]
    return [5, n-16]
}

draw_map = (mp) =>{
    console.log(mp)
    set_map()
    cal_dot_pos()
    c.width = c.width
    for(let i of mp){
        let cor = n2cor(i[0])
        draw_img(i[1], sx[cor[0]-1] + (cor[1]-1) * img_width, sy[cor[0]-1])
    }

    add_point_btn()
    add_number_circle(mp)
}