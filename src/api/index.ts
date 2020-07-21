
import reuqest from '@/utils/request';

type getCustomerLiveInfoType = {
  roomId: string;
  uid: string;
  uname: string;
};

export function getCustomerLiveInfo(params: getCustomerLiveInfoType){
  return reuqest.post('/hs/group/getCustomerLiveInfo', {
    data: params,
  });
};

type getCoachLiveInfoType = {
  roomId: string;
  uname: string;
};
export function getCoachLiveInfo(params: getCoachLiveInfoType){
  return reuqest.post('/hs/group/getCoachLiveInfo', {
    data: params,
  });
};

interface changeClassStatusParamsType{
  roomId: string;
  /** true 为设置为上课 */
  status: boolean;
}
/**
 * 上下课
 */
export function changeClassStatus(params: changeClassStatusParamsType){
  return reuqest.post('/hs/group/classStatus', {
    data: params,
  });
}

interface BanUserParamsType{
  roomId: string;
  uid: string;
}
/**
 * 踢人
 */
export function banUser(params: BanUserParamsType){
  return reuqest.post('/hs/group/banUser', {
    data: params,
  });
}


/**
 * 获得 课程名称
 */
export function getLessonInfo(params: any){
  return reuqest.get(`/hs/group/${params.id}`);
}


interface getUserStatusType{
  roomId: string;
  uid: string;
  uname?: string;
}
/**
 * 客户端轮询查询状态
 */
export function getUserStatus(params: getUserStatusType){
  return reuqest.post('/hs/group/syncStatus', {
    data: params,
  });
}
