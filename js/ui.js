// join channel modal
var agoraAppId = ROOMInfo.appId;
var roomId = ROOMInfo.roomId;
var interfaceUrl = "https://wslive.local.hidbb.com"
// var interfaceUrl = "http://192.168.10.228:9999"
console.log(agoraAppId, "agoraAppId");
$("#refrsh-btn").click(function (event) {
  // var agoraAppId = $('#form-appid').val();
  leaveChannel();
  initClientAndJoinChannel(agoraAppId, ROOMInfo.roomId);
});
$("#edit-setting").click(function (event) {
  // var agoraAppId = $('#form-appid').val();
  leaveChannel();

  initClientAndJoinChannel(agoraAppId, roomId);
  $("#modalSetting").modal("hide");
});
// $("#cameraId").change(function(e){
//   leaveChannel();
//   console.log('??',e)
//   var channelName = localStorage.getItem('form-channel')
//   $('.collapsible-body').hide()
//   initClientAndJoinChannel(agoraAppId, channelName);
// });
// $("#microphoneId").change(function(e){
//   leaveChannel();
//   console.log('??',e)
//   var channelName = localStorage.getItem('form-channel')
//   localStorage.setItem('form-microphoneId',e.target.value)
//   $('.collapsible-body').hide()
//   initClientAndJoinChannel(agoraAppId, channelName);
// });


// UI buttons
function enableUiControls(localStream) {
  if($("#mic-btn")){
    $("#mic-btn").prop("disabled", false);
    $("#mic-btn").click(function () {
      toggleMic(localStream);
    });
  }
  $("#video-btn").prop("disabled", false);
  $("#screen-share-btn").prop("disabled", false);
  $("#exit-btn").prop("disabled", false);



  $("#video-btn").click(function () {
    toggleVideo(localStream);
  });

  $("#screen-share-btn").click(function () {
    toggleScreenShareBtn(); // set screen share button icon
    $("#screen-share-btn").prop("disabled", true); // disable the button on click
    if (screenShareActive) {
      stopScreenShare();
    } else {
      initScreenShare();
    }
  });

  $("#exit-btn").click(function () {
    console.log("so sad to see you leave the channel");
    leaveChannel();
  });

  // keyboard listeners
  $(document).keypress(function (e) {
    switch (e.key) {
      case "m":
        console.log("squick toggle the mic");
        toggleMic(localStream);
        break;
      case "v":
        console.log("quick toggle the video");
        toggleVideo(localStream);
        break;
      case "s":
        console.log("initializing screen share");
        toggleScreenShareBtn(); // set screen share button icon
        $("#screen-share-btn").prop("disabled", true); // disable the button on click
        if (screenShareActive) {
          stopScreenShare();
        } else {
          initScreenShare();
        }
        break;
      case "q":
        console.log("so sad to see you quit the channel");
        leaveChannel();
        break;
      default: // do nothing
    }

    // (for testing)
    if (e.key === "r") {
      window.history.back(); // quick reset
    }
  });
}

function toggleBtn(btn) {
  btn.toggleClass("btn-dark").toggleClass("btn-danger");
}

function toggleScreenShareBtn() {
  $("#screen-share-btn").toggleClass("btn-danger");
  $("#screen-share-icon")
    .toggleClass("fa-share-square")
    .toggleClass("fa-times-circle");
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    $(elementID).attr("style", "display:block");
  } else {
    $(elementID).attr("style", "display:none");
  }
}

function toggleMic(localStream) {
  toggleBtn($("#mic-btn")); // toggle button colors
  $("#mic-icon")
    .toggleClass("fa-microphone")
    .toggleClass("fa-microphone-slash"); // toggle the mic icon
  if ($("#mic-icon").hasClass("fa-microphone")) {
    localStream.unmuteAudio(); // enable the local mic
    toggleVisibility("#mute-overlay", false); // hide the muted mic icon
  } else {
    localStream.muteAudio(); // mute the local mic
    toggleVisibility("#mute-overlay", true); // show the muted mic icon
  }
}

function toggleVideo(localStream) {
  toggleBtn($("#video-btn")); // toggle button colors
  $("#video-icon").toggleClass("fa-video").toggleClass("fa-video-slash"); // toggle the video icon
  if ($("#video-icon").hasClass("fa-video")) {
    localStream.unmuteVideo(); // enable the local video
    toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
  } else {
    localStream.muteVideo(); // disable the local video
    toggleVisibility("#no-local-video", true); // show the user icon when video is disabled
  }
}

