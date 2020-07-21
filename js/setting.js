var resolutions = [
    {
        name: "default",
        value: "default",
    },
    {
        name: "480p",
        value: "480p",
    },
    {
        name: "720p",
        value: "720p",
    },
    {
        name: "1080p",
        value: "1080p"
    }
]
$(function () {
    // This will fetch all the devices and will populate the UI for every device. (Audio and Video)
    getDevices(function (devices) {
        devices.audios.forEach(function (audio,index) {
            $("<option/>", {
                value: audio.value,
                text: audio.name,
            }).appendTo("#microphoneId")
        })
        devices.videos.forEach(function (video,index) {
            $("<option/>", {
                value: video.value,
                text: video.name,
            }).appendTo("#cameraId")
        })
        // To populate UI with different camera resolutions
        resolutions.forEach(function (resolution) {
            $("<option/>", {
                value: resolution.value,
                text: resolution.name
            }).appendTo("#cameraResolution")
        })
        // M.AutoInit()
    })
})
$('.collapsible-cog').click(() => {
    console.log('shezhi')
    $('#modalSetting').modal("show");

})
// $("#join").on("click", function (e) {
//     console.log("join")
//     e.preventDefault();
//     var params = serializeformData(); // Data is feteched and serilized from the form element.
//     console.log(params)
//     // if (validator(params, fields)) {
//     //   join(rtc, params)
//     // }
//   })
  function serializeformData() {
  var formData = $("#form").serializeArray()
  var obj = {}
  for (var item of formData) {
    var key = item.name
    var val = item.value
    obj[key] = val
  }
  obj["appID"] = ROOMInfo.appId
  // obj["channel"] = "hello"
  obj["token"] = ROOMInfo.token
  return obj
}
function getDevices(next) {
    AgoraRTC.getDevices(function (items) {
        items.filter(function (item) {
            return ["audioinput", "videoinput"].indexOf(item.kind) !== -1
        })
            .map(function (item) {
                return {
                    name: item.label,
                    value: item.deviceId,
                    kind: item.kind,
                }
            })
        var videos = []
        var audios = []
        for (var i = 0; i < items.length; i++) {
            var item = items[i]
            if ("videoinput" == item.kind) {
                var name = item.label
                var value = item.deviceId
                if (!name) {
                    name = "camera-" + videos.length
                }
                videos.push({
                    name: name,
                    value: value,
                    kind: item.kind
                })
            }
            if ("audioinput" == item.kind) {
                var name = item.label
                var value = item.deviceId
                if (!name) {
                    name = "microphone-" + audios.length
                }
                audios.push({
                    name: name,
                    value: value,
                    kind: item.kind
                })
            }
        }
        next({ videos: videos, audios: audios })
    })
}
