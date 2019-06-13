"use strict";
import {
  Loading,
  Message
} from 'element-ui';

//请求loading
export const load = {
  l: null,
  openLoading: () => {
    load.l = Loading.service({
      lock: true,
      text: '请求中……',
      spinner: 'el-icon-loading',
      background: 'rgba(255, 255, 255, 0.2)'
    });
  },
  closeLoading: () => {
    load.l.close();
  }
}

/**
 * 表格数据排序
 */
export function dataSort(data, currentPage) {
  if (data instanceof Array) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        data[i].fNum = (i + 1) + (currentPage - 1) * 50;
      }
      return data;
    }
  }
}



/**
 * form表单检验
 */
export function formCheck(obj, name) {
  let result = false;
  obj.$refs[name].validate((valid) => {
    if (valid) {
      result = true;
    } else {
      Message.warning('请完善信息!');
      result = false;
    }
  });
  return result;
}

/**
 * 去掉文本的前后空格
 */
export function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 日期格式化
 * Format(val,"yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * Format(val,"yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
export function dateFormat(val, fmt) { //author: meizz
  val = new Date(val);
  if (!fmt) {
    //fmt = 'yyyy-MM-dd hh:mm:ss.S';
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  let o = {
    "M+": val.getMonth() + 1, //月份
    "d+": val.getDate(), //日
    "h+": val.getHours(), //小时
    "m+": val.getMinutes(), //分
    "s+": val.getSeconds(), //秒
    "q+": Math.floor((val.getMonth() + 3) / 3), //季度
    "S": val.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (val.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
  }
  return fmt;
}

/**
 * 深度复制
 */
export function deepClone(source) {
  let sourceCopy = source instanceof Array ? [] : {};
  for (let item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepClone(source[item]) : source[item];
  }
  return sourceCopy;
}

/**
 * 数组求差值
 */
export function diff(arrA, arrB) {
  return arrA.filter(function (i) {
    return arrB.indexOf(i) < 0;
  });
};

/**
 * 基础递归
 */
export function recursion(val, key, data) {
  try {
    let result = null;
    for (let item of data) {
      if (typeof item === 'undefined' && typeof item !== 'object') {
        return result;
      }
      for (let k in item) {
        if (key === k) {
          if (item[k] === val) {
            result = item;
          }
        }
      }
      if (result) {
        return result;
      }
      if (typeof item.children !== 'undefined' && item.children) {
        result = recursion(val, key, item.children);
      }
    }
    return result;
  } catch (error) {

  }

}

