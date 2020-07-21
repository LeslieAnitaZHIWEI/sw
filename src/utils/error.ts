import { message } from 'antd';
import {apiType} from '@/utils/request';

interface apiCatchType {
  response:{
    data: apiType;
    message: string;
  }
}

export function getApiError(e: apiType): string {

  const { response } = e as apiCatchType;

  if(response){
    const { data } = response;
    if(data){
      return data.msg || data.message || '未知错误';
    }else if(response.message){
      return response.message;
    }
  }else{

    const msg = ((e as apiType).msg || (e as apiType).message);

    if(msg){
      return msg;
    }else{
      const { data } = e as apiType;
      const { msg, message} = data;

      return msg || message || '未知错误';
    }
  }

  return '未知错误';

}

export function getApiCatchError(e):Promise<any> {

  return new Promise((resolve, reject) => {
    const { response } = e;

    if(response.json){
      response.json().then((data) => {
        resolve(getApiError(data));
      }).catch(error => reject(response));
    }
  });

}


export function apiErrorHandler(e){

  const { response } = e;

  if(response && response.json){
    getApiCatchError(e).then(tip => {
      message.error(tip);
    });
  }else{
    message.error(getApiError(e));
  }

}


