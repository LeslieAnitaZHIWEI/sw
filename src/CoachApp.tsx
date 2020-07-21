import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Select, message, Button } from 'antd';
import {
  StopOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import SplitterLayout from 'react-splitter-layout';
import { useBoolean } from '@umijs/hooks';
import RTCSDK from '@/utils/RTCSDK';
import { banUser, changeClassStatus, getLessonInfo } from '@/api/index';
import { apiErrorHandler } from '@/utils/error';
import { getLocationQuery } from '@/utils/index';

import useDevices from '@/hooks/useDevices';
import useStream from '@/hooks/useStream';

import RoomInfoPanel from '@/components/roomInfoPanel';

import 'react-splitter-layout/lib/index.css';

import styles from './style/coachApp.less';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

interface AppProps {}

const locationQuery = getLocationQuery();

const App: React.FC<AppProps> = () => {

  const [form] = Form.useForm();

  const { state: deviceVisible, setTrue: showDeviceModal, setFalse: hideDeviceModal } = useBoolean(false);
  const { state: mainMicrophoneEnable, toggle: toggleMainMicrophone } = useBoolean(true);

  const [roomId, setRoomId] = useState('');
  const [nickName, setNickName] = useState('');

  const {cameraList, microphoneList} = useDevices();

  const {
    roomInfo,
    setRoomInfo,
    lessonInfo,
    remoteStreams,
    remoteStreamsRef,
    setMainRemoteStreamId,
    mainRemoteStreamId,
    localStreams,
    cameraId,
    changeCameraId,
    microphoneId,
    changeMicrophoneId,
  } = useStream({
    roomId: locationQuery['roomId'],
    isCoach: true,
    uid: locationQuery['uid'],
    token: locationQuery['accessToken'],
    id: locationQuery['id'],
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


  useEffect(() => {

    form.setFieldsValue({
      cameraId,
      microphoneId
    });

  }, [cameraId, microphoneId]);

  const [microphoneEnable , setMicrophoneEnable] = useState(true);
  const toggleMicrophone = useCallback(() => {

    if(microphoneEnable){
      localStreams.camera.stream.muteAudio();
      setMicrophoneEnable(false);
    }else{
      localStreams.camera.stream.unmuteAudio();
      setMicrophoneEnable(true);
    }


  }, [remoteStreams, microphoneEnable]);

  const [cameraEnable , setCameraEnable] = useState(true);
  const toggleCamera = useCallback(() => {

    if(cameraEnable){
      localStreams.camera.stream.muteVideo();
      setCameraEnable(false);
    }else{
      localStreams.camera.stream.unmuteVideo();
      setCameraEnable(true);
    }

  }, [remoteStreams, cameraEnable]);

  const changeMicrophoneEnable = useCallback(() => {

    if(mainRemoteStreamId){

      let i = remoteStreams.length;

      for(;i--;){
        const item = remoteStreams[i];

        const id = item.getId();

        if(id === mainRemoteStreamId){

          if(mainMicrophoneEnable){
            item.muteAudio();
          }else{
            item.unmuteAudio();
          }

          toggleMainMicrophone();
          break;
        }
      }
   }
  }, [mainRemoteStreamId,remoteStreams, mainMicrophoneEnable]);

  const playById = useCallback((streamId) => {

    let playTarget;

    remoteStreams.forEach(item => {

      const id = item.getId();

      item.stop();

      if(id === streamId){
        playTarget = item;
      }

    });

    if(playTarget && !(playTarget.isPlaying())){
      playTarget.stop();
      playTarget.play('remote-vidoe', {muted: !mainMicrophoneEnable});
      playTarget.unmuteAudio();
    }


  }, [remoteStreams, mainMicrophoneEnable]);

  /** 根据ID上墙 */
  const playStreamById = useCallback((id) => {

    /** 如果已经上墙了 */
    if(id === mainRemoteStreamId){
      message.info('此用户已经上墙');
      return;
    }

    remoteStreams.forEach((item) => {

      const itemId = item.getId();


      if(itemId === mainRemoteStreamId){
        const miniVidoeDom = $(`#mini_video_${itemId}`);
        item.stop();
        item.setVideoEncoderConfiguration({
          resolution: {
            width: 160,
            height: 120
          },
        });
        item.play(`mini_video_${itemId}`);
        item.muteAudio();
        miniVidoeDom.find('button[data-val="fullscreen"]').text('上墙');
      }

      if(itemId === id){
        const miniVidoeDom = $(`#mini_video_${itemId}`);
        item.stop();
        item.play('remote-vidoe', {muted: false});
        item.unmuteAudio();
        miniVidoeDom.find('button[data-val="fullscreen"]').text('已上墙');
        setMainRemoteStreamId(id);
      }

    });


  }, [remoteStreams, mainRemoteStreamId]);

  const onClickMiniViewBtn = useCallback((e) => {

    const val = $(e.target).attr('data-val');

    const parent = $(e.target).parents('div.mini-view');

    const sId = parent.eq(0).attr('data-stream-id');

    if(val === 'fullscreen'){
      playStreamById(sId);
    }else if(val === 'kick'){
      /** 踢人 */
      banUser({
        roomId: roomInfo.roomId,
        uid: sId
      }).then((res) => {

        const {code} = res;

        if(code === 0){
          console.log(`踢出:${sId}` );
        }

      });
    }

  }, [playStreamById]);

  useEffect(() => {
    console.warn('remoteStreams数量发生了变化',remoteStreams.length);
    console.warn('remoteStreams数量发生了变化',remoteStreamsRef.current.length);

    const mimiview = $('#miniVideos');

    remoteStreams.forEach(item => {

      console.warn(item.isPlaying());

      const streamId = item.getId();
      const domId = `mini_video_${streamId}`;

      let ele = $(`#${domId}`);

      if(ele.length === 0){
        mimiview.append(`<div id="${domId}" data-stream-id="${streamId}" class="mini-view"><div class="userAvatar"><span class="name">学员</span></div><div class="operation"><button type="button" class="ant-btn ant-btn-primary ant-btn-round ant-btn-sm" data-val="fullscreen">上墙</button><button type="button" class="ant-btn ant-btn-primary ant-btn-dangerous ant-btn-round ant-btn-sm" data-val="kick">踢人</button></div></div>`);
        ele = $(`#${domId}`);
      }

      if(domId !== mainRemoteStreamId){

        /** 加入到小窗中 */
        item.setVideoEncoderConfiguration({
          resolution: {
            width: 160,
            height: 120
          },
        });
        item.play(`mini_video_${item.getId()}`, {fit: 'contain', muted: true});

      }else{


        /** 加入大窗口了，不用管 */
        if(mainRemoteStreamId !== '' && !item.isPlaying()){
          const miniVidoeDom = $(`#mini_video_${streamId}`);
          item.stop();
          item.play('remote-vidoe', {muted: false});
          item.unmuteAudio();
          ele.find('button[data-val="fullscreen"]').text('已上墙');
        }

      }

    });

    const domeList = mimiview.find('div[data-stream-id]');
    let isMatch = true;

    /** 查看 dom 是否与 remoteStreams 匹配 */
    let i = domeList.length;
    if(i > remoteStreams.length){
      for(; i--; ){

        const id = domeList.eq(i).attr('data-stream-id');

        if(!(remoteStreams.some(item => item.getId() === id))){
          domeList.eq(i).empty().remove();
        }

      }
    }

    mimiview.off('click').on('click', 'button', onClickMiniViewBtn);

  }, [remoteStreams, mainRemoteStreamId]);

  const onFinish = useCallback(() => {

    const vals = form.getFieldsValue();

    if(localStreams.camera.stream.switchDevice){
      if(cameraId !== vals.cameraId){
        localStreams.camera.stream.switchDevice('video',vals.cameraId, () => {
          changeCameraId(vals.cameraId);
          // Toast.success('切换摄像头成功');
        });
      }

      if(microphoneId !== vals.microphoneId){
        localStreams.camera.stream.switchDevice('audio', vals.microphoneId, () => {
          changeMicrophoneId(vals.microphoneId);
          // Toast.success('切换话筒成功');
        });
      }
    }

    hideDeviceModal();

  }, [microphoneId, cameraId]);

  const [classStatus, setClassStates] = useState(false);
  /** 上下课 */
  const changeClass = useCallback(() => {

    const status = !classStatus

    changeClassStatus({
      roomId: roomInfo.roomId,
      status: status,
    }).then((res) => {

      const {code } = res;
      if(code === 0){
        message.success(status ? '成功上课' : '成功下课');
        setClassStates(status);
      }
    })
  }, [roomInfo, classStatus]);

  return (
    <div>
      <SplitterLayout>
        <SplitterLayout vertical>
          <div className={styles.wh100}><div id="local-video" className={styles.wh100}></div></div>
          <div className={styles.wh100}>
            <div id="remote-vidoe" className={styles.wh100}></div>

            <div style={{display: mainRemoteStreamId !== '' ? 'block' : 'none'}} className={styles.mainScreenOperation}>
                <Button ghost shape="round" icon={mainMicrophoneEnable ? <SoundOutlined /> : <StopOutlined />} onClick={changeMicrophoneEnable}>{mainMicrophoneEnable ? '禁止' : '开启'}主屏音频</Button>
            </div>
          </div>
        </SplitterLayout>

        <SplitterLayout vertical>
          <RoomInfoPanel
          lessonData={lessonInfo}
          changeClass={changeClass}
          classStatus={classStatus}
          microphoneEnable={microphoneEnable}
          cameraEnable={cameraEnable}
          toggleMicrophone={toggleMicrophone}
          toggleCamera={toggleCamera}
          showSetting={showDeviceModal}
          changeMicrophoneEnable={changeMicrophoneEnable}
          mainMicrophoneEnable={mainMicrophoneEnable}
          />
          <div>
            {/* <ul>
            {remoteStreams.map(item => {
              return (<li>{item.getId()}</li>);
            })}
            </ul> */}
            <div id="miniVideos" className={styles.miniVideos}>
            </div>
          </div>
        </SplitterLayout>

      </SplitterLayout>

      <Modal title="选择设备" visible={deviceVisible} onOk={onFinish} onCancel={hideDeviceModal}  forceRender>
        <Form form={form} {...layout}>
          <Form.Item label="摄像头" name="cameraId">
            <Select value={currentCamereId}>
              {cameraList.map(item => {
                return (<Select.Option key={item.value} value={item.value}>{item.name}</Select.Option>);
              })}
            </Select>
          </Form.Item>
          <Form.Item label="话筒" name="microphoneId">
            <Select value={currentMicrophoneId}>
              {microphoneList.map(item => {
                return (<Select.Option key={item.value} value={item.value}>{item.name}</Select.Option>)
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}

export default App;
