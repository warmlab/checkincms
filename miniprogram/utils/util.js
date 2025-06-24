const week_name_list = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]

const format_date = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
	const day = date.getDate()

  return `${[year, month, day].map(format_number).join('/')}`
}

const format_date_with_weekday = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
	const day = date.getDate()
	const weekday = date.getDay()

	return `${year}年${month}月${day}日${week_name_list[weekday]}`
}


const format_time = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(format_number).join('/')} ${[hour, minute, second].map(format_number).join(':')}`
}

const format_number = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const WEEKDAYS = [
  '周日', '周一', '周二', '周三', '周四', '周五', '周六'
]

const strToDate = str => {
  str = str.replace(/-/g, ':').replace(' ', ':');
  var time = str.split(':');
  var date = new Date(time[0], (time[1] - 1), time[2], time[3], time[4]);
  return date;
}

const fromatISODate = str => {
  str = str.replace('T', ' ');
}

const getMonthDay = date => {
  var month = date.getMonth() + 1
  var day = date.getDate()

  return month + '月' + day + '日'
}

const getHourMin = date => {
  var hour = date.getHours();
  var minute = date.getMinutes();

  if (minute < 10)
    return hour + ':0' + minute;
  else
    return hour + ':' + minute;
}

const getWeekDay = date => {
  return WEEKDAYS[date.getDay()];
}

const authAdminUser = (host, shop, openid) => {
  var auth_result = undefined;
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: `${host}/api/${shop}/dragon/auth`,
      header: getCommonHeader(),
      data: {
        openid: openid,
        need: 'create'
      },
      method: 'POST',
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(res);
      },
      //success: function (res) {
      //  console.log('success', res);
      //  if (res.statusCode < 200 || res.statusCode > 204) {
      //    // authentication failed, go back
      //    wx.showToast({
      //      title: res.data.errmsg,
      //      icon: 'none',
      //      duration: 3000
      //    });
      //    //wx.navigateBack();
      //    auth_result = false;
      //  }

      //  auth_result = true;
      //},
      //fail: function (res) {
      //  console.log('failed', res);
      //  wx.showToast({
      //    title: '服务器正在忙，不能进行验证',
      //    icon: 'none',
      //    duration: 3000
      //  });
      //  //wx.navigateBack();
      //  auth_result = false;
      //}
    });
  });

  promise.then(res => {
    console.log('success', res);
    if (res.statusCode < 200 || res.statusCode > 204) {
      // authentication failed, go back
      wx.showToast({
        title: res.data.errmsg,
        icon: 'none',
        duration: 3000
      });
    }

    auth_result = true;
  }).catch(err => {
    console.log('failed', err);
    wx.showToast({
      title: '服务器正在忙，不能进行验证',
      icon: 'none',
      duration: 3000
    });
  });

  //var auth_waiting = setInterval(function () {
  //  if (auth_result !== undefined) {
  //    clearInterval(auth_waiting);
  //    return auth_waiting;
  //  }
  //}, 500);

  //wx.connectSocket({
  //  url: `wss://wecakes.com/api/${shop}/dragon/auth`,
  //    data: {
  //        openid: openid,
  //        need: 'create'
  //    },
  //    method: 'POST',
  //    success: function (res) {
  //      console.log(res);
  //    }
  //});
};

const promisify = f => {
  return function () {
    let args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err, result) {
        if (err) reject(err);
        else resolve(result);
      });
      f.apply(null, args);
    });
  }
};

module.exports = {
	format_date,
	format_time,
	format_date_with_weekday,
  strToDate,
  fromatISODate,
  getMonthDay,
  getHourMin,
  authAdminUser,
  getWeekDay,
  promisify
}
