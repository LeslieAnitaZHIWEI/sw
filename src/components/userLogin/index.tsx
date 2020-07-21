import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Button, Toast, InputItem } from 'antd-mobile';
import moment from 'moment';
import { getLessonInfo } from '@/api/index';
import { getLocationQuery } from '@/utils/index';
import logoUrl from '@/assets/logo.png';
import styles from './index.less';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}


const App: React.FC<any> = (props) => {

  const locationQuery = useMemo(() => {
    return getLocationQuery(props.location.search);
  }, []);

  const [roomId, setRoomId] = useState(locationQuery['roomId'] || '');
  const [userName, setUserName] = useState('');

  const [lessonData, setLessonData] = useState({});

  const onRoomIdChange = useCallback((val) => {
    setRoomId(val);
  }, [roomId]);

  const onUserNameChange = useCallback((val) => {
    setUserName(val);
  }, [userName]);

  const onSubmit = useCallback(() => {
    let isOk = true;
    /** 只需要填写 roomId */
    if(roomId.trim() === '') {
      Toast.info('请输入教室口令');
      isOk = false;
    }

    if(userName.trim() === '') {
      Toast.info('请输入您的昵称');
      isOk = false;
    }

    if(isOk){
      // window.location.href = '`/customer?roomId=${roomId}&userName=${userName}`';
      window.localStorage.setItem('roomData', JSON.stringify({
        roomId: roomId,
        userName: userName,
        id: locationQuery['id']
      }));
      props.history.push({
        pathname:`/customer`,
        query: {
          roomId: roomId,
          userName: userName,
          id: locationQuery['id']
        }
      });
    }


  },[roomId, userName]);

  useEffect(() => {
    if(locationQuery.id){
      Toast.loading();
      getLessonInfo({id: locationQuery.id}).then(res => {

        const {code , data} = res;
        if(code === 0){

          let timeRange = '';
          if(data.openTime){
            /** 开课时间 */
            const time = moment(data.openTime);

            timeRange = moment().format('YYYY年MM月DD日 HH:00 - ');

            timeRange += moment().add(2, 'h').format('HH:00');

          }

          setLessonData({
            name: data.name,
            time: timeRange,
            coachName: data.coachName
          });

        }

        Toast.hide();

      });
    }

  }, [])

  return (
    <div className={styles.loginWraper}>

      <div className={styles.logo}><img src={logoUrl} /></div>

      <div>
        <h1>{lessonData.name}</h1>
        <h2>{lessonData.coachName}</h2>
        <div className="time">{lessonData.time}</div>

        <div className={styles.loginForm}>
          <InputItem
              placeholder="教室口令"
              clear
              defaultValue={roomId}
              onChange={onRoomIdChange}
              onBlur={onRoomIdChange}
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            ></InputItem>

            <InputItem
              placeholder="我的昵称"
              clear
              onChange={onUserNameChange}
              onBlur={onUserNameChange}
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            ></InputItem>

            <Button onClick={onSubmit}>进入教室</Button>
        </div>

      </div>

    </div>
  );
}

export default App;
