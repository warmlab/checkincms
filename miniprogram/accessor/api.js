import request from "./request.js"

const WEB_ALLOWED = 0x01
const MINIPROGRAM_ALLOWED = 0x02

const getStaffInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('staff/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const signUpStaff = (nickname, last_name, first_name, company_id, email, phone) => {
	var data = {
		//avatar_url: avatar_url,
		nickname: nickname,
		last_name: last_name,
		first_name: first_name,
		company_id: company_id,
		email: email,
		phone: phone
	}

	return new Promise((resolve, reject) => {
		request.post('staff/signup', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getCheckInInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('checkin/prepare').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const checkin = (reservation, note, is_togo=false, checkin_time=new Date().getTime()/1000) => {
	var data = {
		reservation: reservation,
		note: note,
		is_togo: is_togo,
		checkin_time: checkin_time
	}	

	return new Promise((resolve, reject) => {
		request.post('checkin/action', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const myCheckinRecord = (time_period_option, begin_date, end_date) => {
	var data = {
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.get('record/checkin', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const takeoutTogo = (togo_id) => {
	return new Promise((resolve, reject) => {
		request.post('togo/takeout', {togo_id: togo_id}).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const updateTogoStatus = (togo_id, index) => {
	var data = {
		togo_id: togo_id,
		index: index
	}

	return new Promise((resolve, reject) => {
		request.post('togo/action', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

//export default getCompanyInfo
const downloadImage = (url, resolve, reject) => {
	wx.downloadFile({
		url: url,
		success: res => {
			if (res.statusCode === 200) {
				var path = res.tempFilePath
				resolve(path)
			} else
				reject(res)
		},
		fail: err => {
			reject(err)
		}
	})
}

module.exports = {
	WEB_ALLOWED,
	MINIPROGRAM_ALLOWED,
	getStaffInfo,
	signUpStaff,
	getCheckInInfo,
	checkin,
	myCheckinRecord,
	takeoutTogo,
	updateTogoStatus,
	downloadImage
}
