import AgoraRTC from 'agora-rtc-sdk';

export interface InputDeviceInfoType{
  deviceId: string;
  groupId: string;
  kind: 'audioinput' | 'videoinput';
  label: string;
}

export interface mediaType{
  name: string;
  value: string;
  kind: 'audioinput' | 'videoinput';
}
export interface devicesMapType{
  videos: mediaType[],
  audios:mediaType[];
}

/** 获得设备的摄像头与话筒 */
export function getDevices(){

  return new Promise<devicesMapType>((resolve, reject) => {
    AgoraRTC.getDevices((devices: InputDeviceInfoType[]) => {

      const videos: mediaType[] = [];
      const audios: mediaType[] = [];

      console.log(devices);

      devices.forEach(item => {

        const newItem = {
          name: item.label,
          value: item.deviceId,
          kind: item.kind,
          groupId: item.groupId,
        } as mediaType;

        if(item.kind === 'audioinput'){
          if(!newItem.name){
            newItem.name = `话筒${audios.length+1}`;
          }
          if(!newItem.value){
            newItem.value = `microphone-${audios.length}`;
          }
          audios.push(newItem);

        }else{

          if(!newItem.name){
            newItem.name = `摄像头${videos.length + 1}`;
          }
          if(!newItem.value){
            newItem.value = `camera-${videos.length}`;
          }
          videos.push(newItem);
        }

      });

      resolve({
        videos,
        audios
      });
    });

  });

}
