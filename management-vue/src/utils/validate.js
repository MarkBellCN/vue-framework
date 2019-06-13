/**
 * 邮箱
 * @param {*} s
 */
export function isEmail (s) {
  return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile (s) {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone (s) {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL (s) {
  return /^http[s]?:\/\/.*/.test(s)
}

/**
 * 用户名
 * @param {*} s
 */
export function isUserName (s) {
  return /^[a-z0-9_-]{3,16}$/.test(s)
}

/**
 * 密码
 * @param {*} s
 */
export function isPwd (s) {
  return /^[a-z0-9_-]{5,18}$/.test(s)
}

/**
 * 校验字符串是否为空
 * @param {*} s
 */
export function isEmpty (s){
  if(typeof s === "undefined" || s === null || s === ""){
      return true;
  }else if(s.replace(/(^s*)|(s*$)/g, "").length > 0){
      return false;
  }else{
    return false;
  }
}

export const elementValidate={
  validatePattern:(rule, value, callback)=>{
    if(typeof value === "undefined" || value === null || value === ""){
      callback();
    }
    let regExp = rule.pattern;
    if (regExp.test(value) === false) {
      callback(new Error(rule.message));
    } else {
      callback();
    }
  },
  validateArray:(rule, value, callback)=>{
    if (!rule.dataArray||rule.dataArray.length<=0) {
      callback(new Error(rule.message));
    } else {
      callback();
    }
  },
}

/**
 * 日期格式化
 * Format(val,"yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * Format(val,"yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
export function dateFormat(val, fmt) {
  val = new Date(val);
  if (!fmt) {
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
