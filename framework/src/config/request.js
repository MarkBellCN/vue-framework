/*
 * @Author: chaoxuelei
 */
import axios from 'axios';
import router from '../router';
import {
    Message
} from 'element-ui';
import {
  baseUrl
} from './baseData';
import {
  load
} from './utils';

export default {
  get: async(url = '', data = {}) => {
    load.openLoading();
    url = baseUrl + url + '?' + new Date().getTime();
    let requestConfig = {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': /*token--------------------------------------------------------------------*/ '',
      },
      mode: "cors",
      cache: "force-cache",
    }
    try {
      const response = await axios.get(url, requestConfig);
      const responseJson = response.data;
      load.closeLoading();
      return responseJson;
    } catch (error) {
      console.log(error)
      load.closeLoading();
      Message.error('请求异常');
      if(error.response.status === 401) {
        this.$router.push('/login');
        return;
      }
      return {
        success: false,
        msg: '请求异常'
      }
      load.closeLoading();
    }
  },
  post: async(url = '', data = {}) => {
    load.openLoading();
    url = baseUrl + url;
    try {
      let requestConfig = {
        credentials: 'include',
        method: 'POST',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': /*token--------------------------------------------------------------------*/'',
          'withCredentials': true
        },
        mode: "cors",
        cache: "force-cache",
      }
      const response = await axios.post(url, data, requestConfig);
      load.closeLoading();
      const responseJson = response.data;
      return responseJson;
    } catch (error) {
      console.log(error)
      load.closeLoading();
      Message.error('请求异常');
      if(error.response.status === 401) {
        this.$router.push('/login');
        return;
      }
      return {
        success: false,
        msg: '请求异常'
      }
    }
  },
  fileUpload: async(url = '', data = { }) => {
    load.openLoading();
    url = baseUrl + url;
    try {
      let requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': /*token--------------------------------------------------------------------*/ '',
        },
      }
      let fs = new FormData();
      fs.append('file', data);
      const response = await axios.post(url, fs, requestConfig);
      load.closeLoading();
      if (response.status === 401) {
        this.$router.push('/login');
        return;
      }
      const responseJson = response.data;
      return responseJson;
    } catch (error) {
      console.log(error)
      Message.error('请求异常');
      load.closeLoading();
      return {
        success: false,
        msg: '请求异常'
      }
    }
  }
};

