var ROOMInfo = {
  _appId:"4cc73d89fd3d480bb7bc418b8832a1c1",
  _roomId:"",
  _token:"",
  _accessToken:"",
  _uid:"",
  _status: "LIVE_OFF",
  _micStatus: "OFF",
  _cameraStatus: "OFF",
  get appId() { return this._appId;},
  set appId(appId) {this._appId = appId;$.cookie("appId",appId);},
  get roomId() { return this._roomId;},
  set roomId(roomId) {this._roomId = roomId;$.cookie("roomId",roomId);},
  get token() { return this._token;},
  set token(token) {this._token = token;$.cookie("token",token);},
  get accessToken() { return this._accessToken;},
  set accessToken(accessToken) {this._accessToken = accessToken;$.cookie("accessToken",accessToken);},
  get uid() { return this._uid;},
  set uid(uid) {this._uid = uid;$.cookie("uid",uid);},
  get status() {return this._status;},
  set status(status) {this._status = status;$.cookie("status",status);},
  // get micStatus() {return this._micStatus;},
  // set micStatus(micStatus) {this._micStatus = micStatus;$.cookie("status",micStatus);},
  // get cameraStatus() {return this._cameraStatus;},
  // set cameraStatus(cameraStatus) {this._cameraStatus = cameraStatus;$.cookie("status",cameraStatus);},
  clearCookie: function(){
    $.cookie("appId",null);
    $.cookie("roomId",null);
    $.cookie("token",null);
    $.cookie("accessToken",null);
    $.cookie("uid",null);
    $.cookie("status",null);
    // $.cookie("micStatus",null);
    // $.cookie("cameraStatus",null);
  },
  setCookie: function(){
    $.cookie("appId",this._appId);
    $.cookie("roomId",this._roomId);
    $.cookie("token",this._token);
    $.cookie("accessToken",this._accessToken);
    $.cookie("uid",this._uid);
    $.cookie("status",this._status);
    // $.cookie("micStatus",_micStatus);
    // $.cookie("cameraStatus",_cameraStatus);
  }
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}


function CurentTime()
{ 
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var clock = year + "-";
    if(month < 10)
        clock += "0";
    clock += month + "-";
    if(day < 10)
        clock += "0";
    clock += day + " ";
    if(hh < 10)
        clock += "0";
    clock += hh + ":";
    if (mm < 10) clock += '0'; 
    clock += mm; 
    return(clock); 
} 

LOG={
  debug: function (content){
    console.log(CurentTime()+" [debug] "+content);
  },
  info: function (content){
    console.log(CurentTime()+" [info] "+content);
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}