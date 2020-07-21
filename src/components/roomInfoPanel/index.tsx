import React, { useState,useCallback, useEffect, useRef } from 'react';
import { Button, Descriptions } from 'antd';
import {
  RedoOutlined,
  SettingOutlined,
  NotificationOutlined,
  PictureOutlined,
  PoweroffOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  StopOutlined,
} from '@ant-design/icons';

import moment from 'moment';

import {changeClassStatus} from '@/api/index';

import styles from './style.less'

interface AppProps {}

const App: React.FC<AppProps> = (props: any) => {

  const {
    lessonData,
    changeClass,
    classStatus,
    microphoneEnable,
    cameraEnable,
    toggleMicrophone,
    toggleCamera,
    showSetting,
    onQuite,
  } = props;

  const [lessonTimeRange, setLessonTimeRange] = useState('');
  const startTime = useRef(null);
  const [currentTime, setCurrentTime] = useState('');
  const [goTime, setGoTime] = useState('');
  const downTimer = useRef(-1);

  const downClock =  useCallback(() => {
      const now = moment();

        setCurrentTime(now.format('HH:mm:ss'));

        const minutes = now.diff(startTime.current, 'minutes');

        const hs = Math.floor(minutes / 60);

        const mins = minutes - hs * 60;

        setGoTime((hs > 9 ? `${hs}` : `0${hs}`) + ':' + (mins > 9 ? `${mins}` : `0${mins}`));
    },[])

  useEffect(() => {

    if(lessonData.openTime){
      /** 开课时间 */
      const time = moment(lessonData.openTime);

      console.log(moment);

      let timeRange = moment().format('YYYY年MM月DD日 HH:00 - ');

      timeRange += moment().add(2, 'h').format('HH:00');

      setLessonTimeRange(timeRange);

      startTime.current = moment(lessonData.openTime);

      if(downTimer.current > -1){
        window.clearInterval(downTimer.current);
      }

      downClock();
      downTimer.current = setInterval(downClock, 3000);

    }

    return () => {
      if(downTimer.current > -1){
        window.clearInterval(downTimer.current);
      }
    };

  },[lessonData.openTime, startTime]);

  return (<div className={styles.roomInfoPanel}>

    <Descriptions column={2}>
      <Descriptions.Item label="课程名称">{lessonData.name}</Descriptions.Item>
      <Descriptions.Item label="授课老师">{lessonData.coachName}</Descriptions.Item>
      <Descriptions.Item label="课程时间">{lessonTimeRange}</Descriptions.Item>
      <Descriptions.Item label="学员数量">{lessonData.studentLimit}</Descriptions.Item>
      <Descriptions.Item label="开始时间">{lessonData.openTime}</Descriptions.Item>
      <Descriptions.Item label="目前时间">{currentTime}</Descriptions.Item>
      <Descriptions.Item label="已开课">{goTime}</Descriptions.Item>
    </Descriptions>

    <div className={styles.operation}>
      {/* <Button type="primary" shape="round" icon={<RedoOutlined />}>刷新</Button> */}
  <Button type={microphoneEnable? 'primary' : 'default'} shape="round" icon={microphoneEnable?<NotificationOutlined /> : <StopOutlined />} onClick={toggleMicrophone}>{microphoneEnable ? '禁止' : '开启'}麦克风</Button>
  <Button type={cameraEnable? 'primary' : 'default'} shape="round" icon={cameraEnable ? <PictureOutlined /> : <StopOutlined />} onClick={toggleCamera}>{cameraEnable ? '禁止' : '开启'}摄像头</Button>
      <Button type="primary" shape="round" icon={<SettingOutlined />} onClick={showSetting}>设置</Button>
      <Button type="primary" shape="round" danger icon={<PoweroffOutlined />} onClick={onQuite}>退出</Button>
    </div>

    <div className={styles.operation}>
      <Button shape="round" icon={classStatus ? <CloudDownloadOutlined /> : <CloudUploadOutlined />} onClick={changeClass}>{ classStatus ? '下课' : '上课'}</Button>
    </div>

  </div>);

}

export default App;
