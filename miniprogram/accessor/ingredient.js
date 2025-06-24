import request from "./request.js"

const getIngredientInfo = (ingredient_id) => {
	return new Promise((resolve, reject) => {
		request.get('ingredient/info', {ingredient_id: ingredient_id}).then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const getIngredientsInfo = () => {
	return new Promise((resolve, reject) => {
		request.get('ingredients/info').then(res => {
			//wx.setStorageSync('appShopInfo', res.data)
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const updateIngredientInfo = (ingredient_info) => {
	return new Promise((resolve, reject) => {
		request.post('ingredient/update', ingredient_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const deleteIngredientInfo = (ingredient_info) => {
	return new Promise((resolve, reject) => {
		request.delete('ingredient/update', ingredient_info).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	})
}

const latestReservations = () => {
	return new Promise((resolve, reject) => {
		request.get('reservation/latest').then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const makeReservation = () => {
	return new Promise((resolve, reject) => {
		request.post('reservation/new').then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const cancelReservation = () => {
	return new Promise((resolve, reject) => {
		request.post('reservation/cancel').then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const pickupReservation = () => {
	return new Promise((resolve, reject) => {
		request.post('reservation/pickup').then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

module.exports = {
	getIngredientInfo,
	getIngredientsInfo,
	updateIngredientInfo,
	deleteIngredientInfo,
	latestReservations,
	makeReservation,
	cancelReservation,
	pickupReservation,
}
