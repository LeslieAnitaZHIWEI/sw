import React, { useEffect, useState } from 'react';
import { getDevices } from '@/utils/rtc';

export default function useDevices () {

  const [cameraList, setCameraList] = useState([]);
  const [microphoneList, setMicrophoneList] = useState([]);

  useEffect(() => {
    getDevices().then(res => {
      console.warn(res);
      setCameraList(res.videos);

      setMicrophoneList(res.audios);

    });

  }, []);

  return {cameraList, microphoneList};
}
