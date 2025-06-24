import request from "./request.js"

const getBulletinInfo = (bulletin_id) => {
	return new Promise((resolve, reject) => {
		request.get('bulletin/info', {bulletin_id: bulletin_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getBulletinsInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('bulletins/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateBulletinInfo = (bulletin) => {
	return new Promise((resolve, reject) => {
		request.post('bulletin/update', bulletin).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const deleteBulletinInfo = (bulletin_info) => {
	return new Promise((resolve, reject) => {
		request.delete('bulletin/update', bulletin_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	getBulletinInfo,
	getBulletinsInfo,
	updateBulletinInfo,
	deleteBulletinInfo,
}
