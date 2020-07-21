import { useEffect, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk';
import { getLocationQuery} from '@/utils/index';
import { changeClassStatus, banUser} from '@/api/index';

const cameraVideoProfile = '480p_4'; // 640 × 480 @ 30fps  & 750kbs
const screenVideoProfile = '480p_2'; // 640 × 480 @ 30fps

type useRoomInfoDataType = {
  appId: string;
  roomId: string;
  token: string;
  uid: string;
  accessToken: string;
  status: boolean;
  isPlay: boolean;
  inited;
}

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
const screenClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

let localStream;


const query = getLocationQuery();


const useRoomInfo = (): any => {

  /** 是否连上 */
  const [connected, setConnected] = useState(false);

  const [screenShareActive, setScreenShareActive] = useState(false);

  const [classStatus, setClassStatus] = useState(false);

  const [mainStreamId, setMainStreamId] = useState('');

  const [localStreams, setLocalStreams] = useState({
    camera: {
      id: "",
      stream: {}
    },
    screen: {
      id: "",
      stream: {}
    }
  });
  const [remoteStreams, setRemoteStreams] = useState({});

  /** 当前使用的话筒ID */
  const [microphoneId, setMicrophoneId] = useState('');
  const [cameraId, setCameraId] = useState('');

  const [microphoneStatus, setMicrophoneStatus] = useState(true);
  const [cameraStatus, setCameraStatus] = useState(true);

  useEffect(() => {
    /**  */
    client.on('stream-published', function (evt) {
      console.log("Publish local stream successfully");
    });

    // connect remote streams
    client.on('stream-added', (evt) => {
      var stream = evt.stream;
        var streamId = stream.getId();
        console.log("new stream added: " + streamId);
        // Check if the stream is local
        if (streamId != localStreams.screen.id) {
          console.log('subscribe to remote stream:' + streamId);
          // Subscribe to the stream.
          client.subscribe(stream, function (err) {
            console.log("[ERROR] : subscribe stream failed", err);
          });
        }
    });

    client.on('stream-subscribed', (evt) => {
      var remoteStream = evt.stream;
      var remoteId = remoteStream.getId();

      const newRemoteStreams = {...remoteStreams};

      newRemoteStreams[remoteId] = remoteStream;

      setRemoteStreams(newRemoteStreams);

      console.log("Subscribe remote stream successfully: " + remoteId);

      /** 把主屏换成当前的 */

      // if( $('#full-screen-video').is(':empty') ) {
      //   mainStreamId = remoteId;
      //   remoteStream.play('full-screen-video');
      // } else {
      //   addRemoteStreamMiniView(remoteStream);
      // }
    });

    /** 当用户离开 */
    client.on("peer-leave", function(evt) {
      const streamId = evt.stream.getId(); // the the stream id

      const newData = {
        ...remoteStreams
      };

      if(newData[streamId]) {
        newData[streamId].stop(); // stop playing the feed

        if (streamId == mainStreamId) {
          var streamIds = Object.keys(newData);
          var randomId = streamIds[Math.floor(Math.random()*streamIds.length)]; // select from the remaining streams
          newData[randomId].stop(); // stop the stream's existing playback
          var remoteContainerID = '#' + randomId + '_container';

          $(remoteContainerID).empty().remove(); // remove the stream's miniView container

          newData[randomId].play('full-screen-video'); // play the random stream as the main stream

          setMainStreamId(randomId);

        } else {
          // var remoteContainerID = '#' + streamId + '_container';
          // $(remoteContainerID).empty().remove(); //
        }

        delete newData[streamId]; // remove stream from list

        setRemoteStreams(newData);
      }
    });

    // show mute icon whenever a remote has muted their mic
    client.on("mute-audio", function (evt) {
      setMicrophoneStatus(true);
    });

    client.on("unmute-audio", function (evt) {
      setMicrophoneStatus(false);
    });

    // show user icon whenever a remote has disabled their video
    client.on("mute-video", function (evt) {
      var remoteId = evt.uid;
      // if the main user stops their video select a random user from the list
      if (remoteId != mainStreamId) {
        // if not the main vidiel then show the user icon
        setCameraStatus(true);
      }
    });

    client.on("unmute-video", function (evt) {
      setCameraStatus(false);
    });

  }, [mainStreamId]);

  const [roomInfoData, setRoomInfoData] = useState<useRoomInfoDataType>({
    appId: '4cc73d89fd3d480bb7bc418b8832a1c1',
    roomId: query.roomId,
    uid: query.uid,
    accessToken: query.accessToken,
    token: '985a67df-2467-4714-804b-9d16c4a53b95',
    status: false,
    isPlay: false,
    inited: false,
  });



  const setRoomInfo = useCallback((data: any) => {

    setRoomInfoData({
      ...roomInfoData,
      ...data,
    });

  }, [roomInfoData]);



  /** 初始化 */
  useEffect(() => {

    if(connected){
      client.init(roomInfoData.appId, () => {
        console.log("AgoraRTC client initialized");

        joinChannel();

        // joinChannel(channelName); // join channel upon successfull init
      }, (err) => {
        console.log("[ERROR] : AgoraRTC client init failed", err);
      });
    }


  }, [connected]);

  const joinChannel = useCallback(() => {
    const {token,roomId, uid} = roomInfoData;

    console.log("userId:"+uid);
    client.join(token, roomId, uid, function(uid) {

      console.log("User " + uid + " join channel successfully");
      createCameraStream();
      localStreams.camera.id = uid; // keep track of the stream uid
    }, (err) => {
        console.log("[ERROR] : join channel failed", err);
    });
  }, [roomInfoData]);

  /** 创建自己摄像头的视频，并显示 */
  const createCameraStream = useCallback(() => {
    var option: {[key: string]: any} = {}; // Data is feteched and serilized from the form element.
    console.log(option,'option');

    if(localStorage.getItem('form-microphoneId')){
      option.microphoneId = localStorage.getItem('form-microphoneId')
    }

    const { uid } = roomInfoData;

    localStream = AgoraRTC.createStream({
      streamID: uid,
      audio: true,
      video: true,
      screen: false,
      microphoneId: microphoneId,
      cameraId: cameraId
    });

    localStream.setVideoProfile(cameraVideoProfile);
    localStream.init(function() {
      console.log("getUserMedia successfully");
      // TODO: add check for other streams. play local stream full size if alone in channel
      localStream.play('local-video', { fit: 'cover' }); // play the given stream within the local-video div

      // publish local stream
      client.publish(localStream, function (err) {
        console.log("[ERROR] : publish local stream error: " + err);
      });

      /** 修改界面 */
      // enableUiControls(localStream); // move after testing
      localStreams.camera.stream = localStream; // keep track of the camera stream for later
    }, (err) => {
      console.log("[ERROR] : getUserMedia failed", err);
    });
  }, [roomInfoData, microphoneId, cameraId]);

  const stopScreenShare = useCallback(() => {

    localStreams.screen.stream.disableVideo(); // disable the local video stream (will send a mute signal)
    localStreams.screen.stream.stop(); // stop playing the local stream
    localStreams.camera.stream.enableVideo(); // enable the camera feed
    localStreams.camera.stream.play('local-video'); // play the camera within the full-screen-video div

    screenClient.leave(function() {

      console.log("screen client leaves channel");

      setScreenShareActive(false);

      screenClient.unpublish(localStreams.screen.stream); // unpublish the screen client
      localStreams.screen.stream.close(); // close the screen client stream
      localStreams.screen.id = ""; // reset the screen id
      localStreams.screen.stream = {}; // reset the stream obj
    }, function(err) {
      console.log("client leave failed ", err); //error handling
    });
  }, []);


  /** 离开频道 */
  const leaveChannel = useCallback(() => {

    if(screenShareActive) {
      stopScreenShare();
    }

    client.leave(function() {
      console.log("client leaves channel");
      localStreams.camera.stream.stop() // stop the camera stream playback
      client.unpublish(localStreams.camera.stream); // unpublish the camera stream
      localStreams.camera.stream.close(); // clean up and close the camera stream

    }, function(err) {
      console.log("client leave failed ", err); //error handling
    });
  }, [screenShareActive]);


  /** 上下课 */
  const onChangeClassStatus = useCallback((params) => {

    changeClassStatus(params).then(res => {

      const {code, data} = res;

      if(code === 0){

        if(params.status === false){
          // 离开
          leaveChannel();
        }

      }

    });

  }, [leaveChannel]);

  /** 踢人 */
  const onKickUser = useCallback((params) => {

    banUser(params).then(res => {

      const {code, data} = res;

      if(code === 0){

        const newData = {...remoteStreams}

        remoteStreams[params.uid].stop();

      }

    });

  }, [remoteStreams]);

  return {
    roomInfoData,
    setRoomInfoData,
    setConnected,
    microphoneId,
    setMicrophoneId,
    cameraId,
    setCameraId,
    classStatus,
    setClassStatus,
  };

};

export {
  useRoomInfo,
}
