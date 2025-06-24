import request from "./request.js"

const getMyNoteInfo = (note_id) => {
	return new Promise((resolve, reject) => {
		request.get('mynote/info', {note_id: note_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getMyNotesInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('mynotes/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getNoteInfo = (note_id) => {
	return new Promise((resolve, reject) => {
		request.get('note/info', {note_id: note_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getNotesInfo = (name, companies, time_period_option, begin_date, end_date) => {
	var data = {
		name: name,
		companies: companies,
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.get('notes/info', data).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateNoteInfo = (note) => {
	return new Promise((resolve, reject) => {
		request.post('note/update', note).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const deleteNoteInfo = (note_info) => {
	return new Promise((resolve, reject) => {
		request.delete('note/update', note_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	getMyNoteInfo,
	getMyNotesInfo,
	getNoteInfo,
	getNotesInfo,
	updateNoteInfo,
	deleteNoteInfo,
}
