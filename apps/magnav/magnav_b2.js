
const Ypos = 40;

const labels = ["N","NE","E","SE","S","SW","W","NW"];
var brg=null;

function drawCompass(course) {
  "ram"
  g.setColor(g.theme.fg);
  g.setFont("Vector",18);
  var start = course-90;
  if (start<0) start+=360;
  g.fillRect(16,Ypos+45,160,Ypos+49);
  var xpos = 16;
  var frag = 15 - start%15;
  if (frag<15) xpos+=Math.floor((frag*4)/5); else frag = 0;
  for (var i=frag;i<=180-frag;i+=15){
    var res = start + i;
    if (res%90==0) {
      g.drawString(labels[Math.floor(res/45)%8],xpos-6,Ypos+6);
      g.fillRect(xpos-2,Ypos+25,xpos+2,Ypos+45);
    } else if (res%45==0) {
      g.drawString(labels[Math.floor(res/45)%8],xpos-9,Ypos+6);
      g.fillRect(xpos-2,Ypos+30,xpos+2,Ypos+45);
    } else if (res%15==0) {
      g.fillRect(xpos,Ypos+35,xpos+1,Ypos+45);
    }
    xpos+=12;
  }
  if (brg) {
    var bpos = brg - course;
    if (bpos>180) bpos -=360;
    if (bpos<-180) bpos +=360;
    bpos= Math.floor((bpos*4)/5)+88;
    if (bpos<16) bpos = 8;
    if (bpos>160) bpos = 170;
    g.setColor(g.theme.fg2);
    g.fillCircle(bpos,Ypos+45,6);
    }
}

var heading = 0;
function newHeading(m,h){ 
    var s = Math.abs(m - h);
    var delta = (m>h)?1:-1;
    if (s>=180){s=360-s; delta = -delta;} 
    if (s<2) return h;
    var hd = h + delta*(1 + Math.round(s/5));
    if (hd<0) hd+=360;
    if (hd>360)hd-= 360;
    return hd;
}

var candraw = false;
var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;

function tiltfixread(O,S){
  "ram"
  var m = Bangle.getCompass();
  var g = Bangle.getAccel();
  m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
  var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
  if (d<0) d+=360;
  var phi = Math.atan(-g.x/-g.z);
  var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
  var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
  var costheta = Math.cos(theta), sintheta = Math.sin(theta);
  var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
  var yh = m.dz*sinphi - m.dx*cosphi;
  var psi = Math.atan2(yh,xh)*180/Math.PI;
  if (psi<0) psi+=360;
  return psi;
}

// Note actual mag is 360-m, error in firmware
function reading() {
  "ram"
  g.clearRect(0,24,175,175);
  var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  heading = newHeading(d,heading);
  drawCompass(heading);
  g.setColor(g.theme.fg);
  g.setFont("6x8",2);
  g.setFontAlign(-1,-1);
  g.drawString("o",120,Ypos+80);
  g.setFont("Vector",40);
  var course = Math.round(heading);
  var cs = course.toString();
  cs = course<10?"00"+cs : course<100 ?"0"+cs : cs;
  g.drawString(cs,50,Ypos+90);
  g.setColor(g.theme.fg2);
  g.fillPoly([88,Ypos+60,78,Ypos+80,98,Ypos+80]);
  g.setColor(g.theme.fg);
  g.flip();
}

function calibrate(){
  var max={x:-32000, y:-32000, z:-32000},
      min={x:32000, y:32000, z:32000};
  var ref = setInterval(()=>{
      var m = Bangle.getCompass();
      max.x = m.x>max.x?m.x:max.x;
      max.y = m.y>max.y?m.y:max.y;
      max.z = m.z>max.z?m.z:max.z;
      min.x = m.x<min.x?m.x:min.x;
      min.y = m.y<min.y?m.y:min.y;
      min.z = m.z<min.z?m.z:min.z;
  }, 100);
  return new Promise((resolve) => {
     setTimeout(()=>{
       if(ref) clearInterval(ref);
       var offset = {x:(max.x+min.x)/2,y:(max.y+min.y)/2,z:(max.z+min.z)/2};
       var delta  = {x:(max.x-min.x)/2,y:(max.y-min.y)/2,z:(max.z-min.z)/2};
       var avg = (delta.x+delta.y+delta.z)/3;
       var scale = {x:avg/delta.x, y:avg/delta.y, z:avg/delta.z};
       resolve({offset:offset,scale:scale});
     },20000);
  });
}

var calibrating=false;
function docalibrate(first){
    calibrating=true;
    const title = "Calibrate";
    const msg = "takes 20 seconds";
    function restart() {
        calibrating=false;
        setButtons();
        startdraw();
    }
    function action(b){
        if (b) {
          g.clearRect(0,24,175,175);
          g.setColor(g.theme.fg);
          g.setFont("Vector",18);
          g.setFontAlign(0,-1);
          g.drawString("Fig 8s to",88,Ypos);
          g.drawString("Calibrate",88,Ypos+18);
          g.flip();
          calibrate().then((r)=>{
            require("Storage").write("magnav.json",r);
            restart();
          });
        } else {
          restart();
        }
    }   
    if (first===undefined) first=false;
    stopdraw();
    if (first) 
        E.showAlert(msg,title).then(action.bind(null,true));
    else 
        E.showPrompt(msg,{title:title,buttons:{"Start":true,"Cancel":false}}).then(action);
}

var intervalRef;

function startdraw(){
  g.clear(1);
  Bangle.drawWidgets();
  candraw = true;
  intervalRef = setInterval(reading,200);
}

function stopdraw() {
  candraw=false;
  if(intervalRef) {clearInterval(intervalRef);}
}

function setButtons(){
  function actions(v){
    if (!v) docalibrate(false);
    else if (v==1) brg=null;
    else brg=heading;
  }
  Bangle.setUI("updown",actions);
}

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

Bangle.loadWidgets();
Bangle.setCompassPower(1);
if (!CALIBDATA) 
  docalibrate(true);
else {  
  startdraw();
  setButtons();
}



