import React, { useEffect, useState, useCallback, useRef } from 'react';
import produce from "immer";
import AgoraRTC from '@/utils/RTCSDK';
import { getDevices } from '@/utils/rtc';
import { getCustomerLiveInfo, getCoachLiveInfo, getLessonInfo } from '@/api/index';
import { apiErrorHandler } from '@/utils/error';

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
// const screenClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

const cameraVideoProfile = '480p_4'; // 640 × 480 @ 30fps  & 750kbs
const screenVideoProfile = '480p_2'; // 640 × 480 @ 30fps

let localStream;

const localStreams = {
  camera: {
    id: "",
    stream: {}
  },
  screen: {
    id: "",
    stream: {}
  }
}

export default function useStream ({roomId = '', name = '',isCoach = false, uid = '', token = '',id = ''}) {

  const [roomInfo, setRoomInfo] = useState({
    appId: '',
    roomId: roomId,
    status: false,
    token: '',
    uid,
  });

  const [microphoneId, setMicrophoneId] = useState(localStorage.getItem('form-microphoneId') || '');
  const [cameraId, setCameraId] = useState(localStorage.getItem('form-cameraId') || '');

  /**
   * 使用 useRef ，是因为有时候拿不到最新的 remoteStreams
   */
  const remoteStreamsRef = useRef([]);
  const [remoteStreams, setRemoteStreams] = useState([]);

  /** 当前播放的选程视频ID */
  const [mainRemoteStreamId, setMainRemoteStreamId] = useState('');

  /** 获得房间信息 */
  const [lessonInfo, setLessonInfo] = useState({});

  const coachStreamId = useRef('');

  /**
   * 加入通道后
   * 创建自己摄像头的视频，并显示
   *  */
  const createCameraStream = useCallback(() => {
    var option: {[key: string]: any} = {}; // Data is feteched and serilized from the form element.

    const { uid } = roomInfo;

    localStream = AgoraRTC.createStream({
      streamID: uid,
      audio: true,
      video: true,
      screen: false,
      microphoneId: microphoneId || '',
      /** 如果为 default，用不是摄像头 */
      cameraId: cameraId === 'default' ? '' : (cameraId || ''),
    });

    localStream.setVideoProfile(cameraVideoProfile);

    localStream.init(function() {
      console.warn("getUserMedia successfully");
      // TODO: add check for other streams. play local stream full size if alone in channel
      localStream.play('local-video', {fit: 'contain', muted: true}); // play the given stream within the local-video div

      // publish local stream
      client.publish(localStream, function (err) {
        console.error("[ERROR] : publish local stream error: " + err);
      });

      /** 修改界面 */
      // enableUiControls(localStream); // move after testing
      localStreams.camera.stream = localStream; // keep track of the camera stream for later
    }, (err) => {
      console.log("[ERROR] : getUserMedia failed", err);
    });
  }, [roomInfo, microphoneId, cameraId]);

  /**
   * 初始化后，加入通道
   */
  const joinChannel = useCallback(() => {
    const {token,roomId, uid} = roomInfo;

    console.log("userId:"+uid);
    client.join(token, roomId, uid, function(uid) {

      console.log("User " + uid + " join channel successfully");
      createCameraStream();
      localStreams.camera.id = uid; // keep track of the stream uid
    }, (err) => {
        console.log("[ERROR] : join channel failed", err);
    });
  }, [roomInfo]);

  const initClient = useCallback(() => {

    if(roomInfo.appId){
      client.init(roomInfo.appId, () => {
        console.log("AgoraRTC client initialized");

        joinChannel();

        // joinChannel(channelName); // join channel upon successfull init
      }, (err) => {
        console.log("[ERROR] : AgoraRTC client init failed", err);
      });
    }

  }, [roomInfo.appId]);

  /** 初始化 */
  useEffect(() => {

    initClient();

  }, [roomInfo.appId]);


  const onStreamPublished = useCallback(() => {
    console.log("Publish local stream successfully");
  }, []);

  const addRemoteStream = useCallback((evt) => {

    const remoteStream = evt.stream;
    const remoteId = remoteStream.getId();

    console.warn("new stream added: " + remoteId);

    // 如果不是自己的，订阅
    if (remoteId != localStreams.screen.id) {
      console.warn('subscribe to remote stream:' + remoteId);
      // Subscribe to the stream.
      client.subscribe(remoteStream, function (err) {
        console.warn("[ERROR] : subscribe stream failed", err);
      });
    }

  }, []);

  const subscribeStream = useCallback((evt) => {
    const remoteStream = evt.stream;
    const remoteId = remoteStream.getId();
    const current = remoteStreamsRef.current;

    /** 如果还没有 */
    if(!(current.some(item => item.getId() === remoteId))){
      if(isCoach){
        /** 如果还没有 */
        if(current.length === 0 && document.getElementById('remote-vidoe').childNodes.length === 0){
          setMainRemoteStreamId(remoteId);
          remoteStream.play('remote-vidoe', {fit: 'contain', muted: true});
        }else{
          /** 加入到小视频 */
        }
      }else{
        /** 如果是客户段，只能播放教练 */
        console.warn('当前流ID',remoteId, '教练流ID', coachStreamId.current);
        if(remoteId === coachStreamId.current){
          remoteStream.play('remote-vidoe', {fit: 'contain'});
        }
      }

      const newList = [...current];

      newList.push(remoteStream);

      remoteStreamsRef.current = newList;
      setRemoteStreams(newList);
      console.warn('新remoteStreams', remoteStreams.current.map(item => item.getId()));
    }else{
      console.error('新增的remoteStreams已经存在', remoteId);
    }

  }, [remoteStreams, mainRemoteStreamId]);

  const removeStream = useCallback(() => {

  }, []);

  const removeStreamById = useCallback((evt) => {
    var streamId = evt.stream.getId(); // the the stream id

    const current = remoteStreamsRef.current;
    let stream;
    let streamIndex = -1;
    current.forEach((item, index) => {

      if(item && item.getId() === streamId){
        stream = item;
        streamIndex = index;
        return true;
      }

      return false;
    });

    if(streamIndex !== -1) {

      stream.stop(); // stop playing the feed
      const newList = [...current];
      newList.splice(streamIndex, 1);
      remoteStreamsRef.current = newList;
      console.warn('remoteStreams 删除', streamId);
      console.warn(remoteStreamsRef.current);
      setRemoteStreams(newList);

      /** 如果是 主屏的 */
      if(mainRemoteStreamId === streamId){

        if(newList.length > 0){
          setMainRemoteStreamId(newList[0].getId());
        }else{
          setMainRemoteStreamId('');
        }

      }
    }

  }, [remoteStreams, mainRemoteStreamId]);

  /** 仅客户端使用 */
  const leaveChannel = useCallback(() => {

    if(isCoach){
      client.leave(function () {
        // stop stream
        if(localStreams.camera.stream.isPlaying()) {
          localStreams.camera.stream.stop();
        }
        // close stream
        localStreams.camera.stream.close()
        for (let i = 0; i < remoteStreams.length; i++) {
          const stream = remoteStreams[i];
          if(stream.isPlaying()) {
            stream.stop();
          }
        }
        localStream = null;
        setRemoteStreams([]);
        client = null;
        console.log("client leaves channel success")

      }, function (err) {
        console.log("channel leave failed")
        Toast.error("leave success")
        console.error(err)
      })
    }else{
      client.leave(function() {
        console.log("client leaves channel");
        localStreams.camera.stream.stop() // stop the camera stream playback
        client.unpublish(localStreams.camera.stream); // unpublish the camera stream
        localStreams.camera.stream.close(); // clean up and close the camera stream
        localStream = null;
        setRemoteStreams([]);
      }, function(err) {
        console.log("client leave failed ", err); //error handling
      });
    }


  },[remoteStreams, isCoach]);

  const initLiveRoom = useCallback(() => {

    /** 获得 */
    const getLiveInfo = isCoach ? getCoachLiveInfo : getCustomerLiveInfo;

    const livePrams = {
      roomId,
    };

    if(!isCoach){
      livePrams.uid = uid;
      livePrams.uname = name;
    }else{
      livePrams.token = token;
    }

    getLiveInfo(livePrams).then(res => {

      const {code, data} = res;

      if(code === 0){

        setRoomInfo({
          appId: data.appId,
          roomId: data.roomId,
          status: data.status,
          token: data.token,
          uid: data.uid
        });
      }else{

      }

    }).catch(apiErrorHandler);

  },[])


  useEffect(() => {

    /** 获得房间信息, 比如名称 */
    getLessonInfo({id}).then(res => {

      const {code , data} = res;
      if(code === 0){
        setLessonInfo(data);

        /** 转成字符足 */
        coachStreamId.current = `${data.coachId}`;

        /** 开始初始化 */
        if (client && !(client._subscribed)) {

          client.on('stream-published', onStreamPublished);
          client.on('stream-added', addRemoteStream);
          client.on('stream-removed', removeStream);
          // client.on("stream-subscribed", subscribeStream);
          client.on('peer-leave', removeStreamById);
          client._subscribed = true;
        }

      }

      initLiveRoom();
    });

  }, []);

  useEffect(() => {
    client.on("stream-subscribed", subscribeStream);
  }, [subscribeStream]);

  const changeCameraId = useCallback((id) => {
    setCameraId(id);
    localStorage.setItem('form-cameraId', id);
  },[setCameraId],);

  const changeMicrophoneId = useCallback((id) => {
    setMicrophoneId(id);
    localStorage.setItem('form-microphoneId', id);
},[setMicrophoneId]);

  return {
    roomInfo,
    setRoomInfo,
    remoteStreams,
    lessonInfo,
    mainRemoteStreamId,
    setMainRemoteStreamId,
    localStreams,
    leaveChannel,
    cameraId,
    changeCameraId,
    microphoneId,
    changeMicrophoneId,
    initClient,
    remoteStreamsRef,
  };
}
