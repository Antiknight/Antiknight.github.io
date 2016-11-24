/**
 * Created by nico on 19/11/2016.
 */

function lerp ( t, a, b ){ return a + t * ( b - a ); }
/**
 * checks if a value has a given bit set to 1
 * @value the int / uint to test
 * @mask the bits to check
 **/
function bit_isset( value, mask )
{
    return ( value & mask ) != 0;
}

/**
 * sets a bit mask to a int / uint
 * @value the int / uint to set the bit mask onto
 * @mask the bits to set
 **/
function bit_set( value, mask )
{
    value |= mask;
    return value;
}

/**
 * clears a bit mask
 * @value the int / uint to clear
 * @mask the bits to clear
 **/
function bit_clear( value, mask )
{
    value &= ~mask;
    return value;
}

/**
 * toggles a bit mask ( 1s become 0s & 0s become 1s )
 * @value the int / uint to toggle
 * @mask the bits to toggle
 **/
function bit_toggle( value, mask )
{
    value ^= mask;
    return value;
}

var Hexagon = function(){

    var masks = [];
    var strokes = [];

    var PI = Math.PI;
    var PI2 = PI * 2;
    var step = PI / 3;
    var startAngle;

    var colors = [
        "#d3dc5d",
        "#f0f978",
        "#e1eb6b",
        "#bbe272",
        "#d0f786",
        "#aced78",
        "#a5ee8d",
        "#8bf28c",
        "#81f3a0",
        "#38f0ac",
        "#4dfeba",
        "#24ffcd"];
    colors.reverse();

    function Hx( angle){

        startAngle = angle || step / 2;
        var i = 0;
        for( var mask = 1; mask < Math.pow( 2, 6 * 2 ); mask *= 2 ){

            masks.push( mask );

            var a = startAngle + i * step;
            var x = Math.cos( a );
            var y = Math.sin( a );
            if( i < 6 ){
                //radius
                strokes.push( [ 0, 0, x, y ] );
            }else{
                //edge
                strokes.push( [ x, y, Math.cos( a + step ), Math.sin( a + step ) ] );
            }
            i++;
        }

        this.solutions = solutions;
    }

    function render( ctx, radius ){
        ctx.beginPath();
        for( var i = 0; i < strokes.length; i++ ){
            ctx.moveTo( strokes[i][0] * radius, strokes[i][1] * radius );
            ctx.lineTo( strokes[i][2] * radius, strokes[i][3] * radius );
        }
        ctx.stroke();
    }

    function renderKey( ctx, radius, prev, key, t ){

        ctx.save();

        var id = 0, x, y;
        for( var i = 0; i < masks.length; i++ ){

            x=NaN;
            y=NaN;
            if( bit_isset( prev, masks[i] ) && bit_isset( key, masks[i] ) ){

                x = strokes[i][2] * radius;
                y = strokes[i][3] * radius;

            }else if( bit_isset( key, masks[i] ) ){

                ctx.strokeStyle = colors[id++];
                x = lerp(t, strokes[i][0] * radius, strokes[i][2] * radius);
                y = lerp(t, strokes[i][1] * radius, strokes[i][3] * radius);

            }else if( bit_isset( prev, masks[i] )  ){

                if( 1-t <= 0 )continue;
                ctx.strokeStyle = colors[id++];
                x = lerp( 1-t, strokes[i][0] * radius, strokes[i][2] * radius );
                y = lerp( 1-t, strokes[i][1] * radius, strokes[i][3] * radius );

            }

            if( !isNaN(x) ){
                ctx.strokeStyle = colors[id++];
                ctx.beginPath();
                ctx.moveTo( strokes[i][0] * radius, strokes[i][1] * radius );
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        ctx.restore();

    }

    function distance( ax, ay, bx, by ){
        var dx = bx - ax;
        var dy = by - ay;
        return Math.sqrt(dx*dx+dy*dy);
    }

    function getEdgeId( x,y, radius ){

        var id = 0;
        var dc = distance(0,0,x,y);
        var md0 = Number.POSITIVE_INFINITY, md1=Number.POSITIVE_INFINITY;
        for( var i = 0; i < masks.length; i++ ){

            var d0 = distance(x,y, strokes[i][0] * radius, strokes[i][1] * radius );
            var d1 = distance(x,y, strokes[i][2] * radius, strokes[i][3] * radius );
            if( i < 6 && dc < radius * .75 ){

                if( d1 < md1 ){
                    md1 = d1;
                    id = masks[i];
                }
            }else if( i > 5 && dc > radius * .75 ){
                if( d0 < md0 && d1 < md1 ){
                    md0 = d0;
                    md1 = d1;
                    id = masks[i];
                }
            }
        }
        return id;
    }

    var p = Hx.prototype;
    p.constructor = Hx;
    p.render = render;
    p.renderKey = renderKey;
    p.getEdgeId = getEdgeId;
    return Hx;

}();

var solutions = [
    21,261,2053,
    2309, 149, 389, 325, 2181,
    213, 2183, 2197, 341, 405, 2437, 151, 2325, 849, 976, 2833, 3348, 3904, 3968,
    215, 469,2453,2516,2389,2513,2961,3412,977,918,2837,3024,3536,2709,
    2229,1365,3920,3984,2469,2769,543,3476,2897,4032,
    2517,2515,3861,3921,3988,2965,3413,1367,2421,1494,2647,3399,1431,3463,
    2771,2899,3478,3974,3907,2901,2294,475,3025,3540,3414,3420,2979,4048,
    575,1087,2855,3343,
    2519,4049,2995,2967,3027,3989,3925,3954,3894,1847,3615,4006,2623,4050,
    3947,4056,4080,3855,3879,2931,2871,3990,2847,3883,3886,
    4053,4039,2935,3550,3543,2007,3799,3871,3895,2879,3511,4007,3919,
    3063,4086,4055,4023,4071,3967
];
function update(){

    time += ( Date.now() - lastTime ) / 3600;
    lastTime = Date.now();
    if( time >= 1 ){
        k++;
        time = 0;
    }
    k %= solutions.length;
    var prev = k-1 < 0 ? solutions.length - 1 : (k-1);
    render( solutions[ prev ] , solutions[ k ] );

    requestAnimationFrame( update );

}

function render( prev, key ){

    radius = Math.min( w, h ) / 2 * .5;

    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    ctx.restore();
    ctx.fillStyle = "#101316";
    ctx.globalAlpha = 1;
    ctx.fillRect(0,0,w,h);

    ctx.lineJoin = ctx.lineCap = "round";
    ctx.save();
    ctx.translate( w/2, h/2 );

    ctx.setLineDash([5, 10]);
    ctx.lineDashOffset = dash-=.25;
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    hx.render( ctx, radius );

    ctx.fillStyle = "#666";
    var fs = parseInt( radius / 5 );
    ctx.font= fs + "px Time";
    var str = ( 1+k );
    var metric = ctx.measureText( str );
    ctx.fillText( str, radius - metric.width - fs, radius +  parseInt( radius / 5) );
    ctx.font= parseInt( radius / 10 ) + "px Time";
    str = "/"+solutions.length;
    ctx.fillText( str, radius - fs, radius + parseInt( radius / 5) );
  
    ctx.setLineDash([0]);
    for( var i = 1; i < 5; i++ ){

        ctx.globalAlpha = 1 - i / 5;
        ctx.lineWidth = 1 + i + 2;
        hx.renderKey( ctx, radius, prev || 4095, key || 4095, Math.min( 1, time ));

    }
    ctx.restore();

}

var canvas, ctx, w, h, hx = new Hexagon();
var k = Math.round((Date.now()/3600) % solutions.length);
//var k = ( solutions.length - 1 );
var radius = 150;
var time = 0;
var lastTime = Date.now();
var dash = 0;

window.onload = function(){

    canvas = document.createElement( 'canvas' );
    document.body.appendChild( canvas );
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    update();
};