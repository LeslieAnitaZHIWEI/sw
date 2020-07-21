import React, { useEffect, useState, useMemo,useCallback,useRef } from 'react';
import { Modal, Button, List, WhiteSpace, Toast } from 'antd-mobile';
import { useRequest, useBoolean } from '@umijs/hooks';
import { getUserStatus, getLessonInfo } from '@/api/index';
import { getUid, getLocationQuery } from '@/utils/index';
import { getApiError } from '@/utils/error';
import useDevices from '@/hooks/useDevices';
import useStream from '@/hooks/useStream';
import { getDevices, mediaType } from '@/utils/rtc';

import { CameraSvg, CameraCloseSvg, SettingSvg, QuiteSvg } from  '@/components/svgIcon/index';
import userPng from  '@/assets/user.png';
import styles from  './index.less';

interface userStatusType{
  cname: string;
  microphone: boolean;
  roomStatus: boolean;
  uid: string;
  uname: string;
  updateTime: string;
  userStatus:boolean;
}

const prompt = Modal.prompt;

interface AppState {
  videos: mediaType[];
  audios: mediaType[];
}

let localUid = window.localStorage.getItem('roomUserId');
if(!localUid){
  localUid = getUid();
  window.localStorage.setItem('roomUserId', localUid);
}

const getStatus = (params):Promise<userStatusType>  => {

  return getUserStatus(params).then((res) => {
    const {code , data} = res;

    if(code === 0){
      return data;
    }
    return res;
  });

};


const App: React.FC<AppProps> = (props) => {

  const locationQuery = useMemo(() => {
    const roomDataStr = window.localStorage.getItem('roomData');
    if(roomDataStr){
      return JSON.parse(roomDataStr);
    }else{

      props.history.push('/');

      return {};
    }
  }, [props]);

  const [roomId, setRoomId] = useState('');
  const [nickName, setNickName] = useState('');

  const {cameraList, microphoneList} = useDevices();

  const {state: devicesVisible, setFalse:hideDevicesModal, setTrue:showDevicesModal } = useBoolean(false);
  const {state: cameraEnable, toggle: toggleCameraEnable } = useBoolean(true);

  const selfQuite = useRef(false);

  /** 如果没有值，回到登录 */
  if(!locationQuery.roomId || !locationQuery.userName){

    props.history.push('/');

  }

  const {
    roomInfo,
    setRoomInfo,
    lessonInfo,
    localStreams,
    leaveChannel,
    cameraId,
    changeCameraId,
    microphoneId,
    changeMicrophoneId,
    initClient,
  } = useStream({
    roomId: locationQuery['roomId'],
    name: locationQuery['userName'],
    uid: localUid,
    id:locationQuery['id']
  });

  /** 下拉列表中的 */
  const [currentCamereId, setCurrentCamereId] = useState(cameraId);
  const [currentMicrophoneId, setCurrentMicrophoneId] = useState(cameraId);

  useEffect(() => {
    setCurrentCamereId(cameraId);
  }, [cameraId]);

  useEffect(() => {
    setCurrentMicrophoneId(cameraId);
  }, [microphoneId]);

  const { data: userStatus, run: runPoll, cancel: stopPoll } = useRequest(getStatus, {
    manual: true,
    pollingInterval: 2000,
    pollingWhenHidden: false
  });

  const userQuite = useCallback(() => {

    leaveChannel();
    stopPoll();
    selfQuite.current = true;

  }, [stopPoll, leaveChannel]);

  useEffect(() => {
    if(userStatus){

      if (!userStatus.roomStatus || !userStatus.userStatus) {
        //直播关闭或被踢出
        try {
          console.log('离开');
          leaveChannel();

          /** 如果是主动离开 */
          if(selfQuite.current){
            stopPoll();
          }

        } catch (error) {

        }

      }else{
        /** 如果为true */
        console.warn('视频是否播放', localStreams && localStreams.camera.stream && localStreams.camera.stream.isPlaying && localStreams.camera.stream.isPlaying());
        if(!(localStreams && localStreams.camera.stream && localStreams.camera.stream.isPlaying && localStreams.camera.stream.isPlaying())){
          // 重新请求
          initClient();
        }
      }

      /** 如果被禁音，关闭这里的声音传输，但用户是不到任何变化的 */
      if(localStreams && localStreams.camera.stream && localStreams.camera.stream.muteAudio){
        userStatus.microphone ? localStreams.camera.stream.muteAudio() : localStreams.camera.stream.unmuteAudio();
      }

    }

  }, [userStatus, localStreams]);

  const toggleCamera = useCallback(() => {

    if(cameraEnable){
      localStreams.camera.stream.muteVideo();
    }else{
      localStreams.camera.stream.unmuteVideo();
    }

    toggleCameraEnable();

  }, [localStreams, cameraEnable]);

  const changeDevices = useCallback(() => {

      if(localStreams.camera.stream.switchDevice){
        if(cameraId !== currentCamereId){
          localStreams.camera.stream.switchDevice('video',currentCamereId, () => {
            changeCameraId(currentCamereId);
            // Toast.success('切换摄像头成功');
          });
        }

        if(microphoneId !== currentMicrophoneId){
          localStreams.camera.stream.switchDevice('audio', currentMicrophoneId, () => {
            changeMicrophoneId(currentMicrophoneId);
            // Toast.success('切换话筒成功');
          });
        }
      }

      hideDevicesModal();

    },
    [cameraId, microphoneId, currentCamereId, currentMicrophoneId],
  )

  /** 教练视频ID */
  const [coachId, setCoachId] = useState('');

  useEffect(() => {

    if(roomInfo && roomInfo.roomId){

      /** 轮询 */
      runPoll({
        roomId: roomInfo.roomId,
        uid: roomInfo.uid,
      });

    }

  },[roomInfo]);

  useEffect(() => {

    if(lessonInfo && lessonInfo.coachId){
      setCoachId(lessonInfo.coachId);
    }

  },[lessonInfo]);

  console.warn('roomStatus:', userStatus && userStatus.roomStatus,'userStatus', userStatus && userStatus.userStatus);
  return (
    <div className={styles.appWraper}>

      <div style={{display: userStatus && userStatus.roomStatus && userStatus.userStatus ? 'block' : 'none'}}>
        <div id="remote-vidoe" className={styles.remoteVideo}></div>
        <div id="local-video" className={styles.localVideo}></div>
        </div>
      <div className={styles.unJoinWraper} style={{display: userStatus && userStatus.roomStatus && userStatus.userStatus? 'none' : 'flex'}}>

        <div className={styles.tip}>本场直播由{lessonInfo.coachName}老师为您提供<br />请耐心等待老师进入...</div>

      </div>

      <div className={styles.operation}>

        <div className={styles.avatar}><img src={userPng} />{locationQuery.userName}</div>
        {cameraEnable ? <Button onClick={toggleCamera}><CameraSvg /></Button> : <Button onClick={toggleCamera}><CameraCloseSvg /></Button>}

        <Button onClick={showDevicesModal}><SettingSvg /></Button>
        <Button onClick={userQuite}><QuiteSvg /></Button>

      </div>

      <Modal
          visible={devicesVisible}
          onClose={hideDevicesModal}
          transparent
          title="更改设备"
          footer={[{ text: 'Cancel', onPress: hideDevicesModal, style: 'default' },{ text: 'Ok', onPress: changeDevices }]}
        >

        <div className={styles.formItem}>
          <div className={styles.formLabel}>摄像头：</div>
          <div className={styles.formInput}>
            <select value={currentCamereId} onChange={(e) => {
              setCurrentCamereId((e.target && e.target.value) || '');
            }}>
              {cameraList.map(item => {
                return <option value={item.value} key={item.value}>{item.name}</option>
              })}
            </select>
          </div>
        </div>

        <div className={styles.formItem}>

          <div className={styles.formLabel}>话筒：</div>
          <div className={styles.formInput}>
            <select value={currentMicrophoneId}onChange={(e) => {
              setCurrentMicrophoneId((e.target && e.target.value) || '');
            }}>
              {microphoneList.map(item => {
                return <option value={item.value} key={item.value}>{item.name}</option>
              })}
            </select>
          </div>
        </div>

      </Modal>


    </div>
  );
}

export default App;
