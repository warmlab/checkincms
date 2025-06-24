import request from "./request.js"

const getCheckinStatistics = (name, companies, time_period_option, begin_date, end_date) => {
	var data = {
		name: name,
		companies: companies,
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.post('statistics/checkin/preview', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const mailCheckinStatistics = (name, companies, time_period_option, begin_date, end_date) => {
	var data = {
		name: name,
		companies: companies,
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.post('statistics/checkin/email', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const getReservationStatistics = (name, companies, time_period_option, begin_date, end_date) => {
	var data = {
		name: name,
		companies: companies,
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.post('statistics/reservation/preview', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const mailReservationStatistics = (name, companies, time_period_option, begin_date, end_date) => {
	var data = {
		name: name,
		companies: companies,
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.post('statistics/reservation/email', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const getPickupStatistics = () => {

}

const currentTogoRecord = () => {
	return new Promise((resolve, reject) => {
		request.post('statistics/togo').then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

const getRecipeStatistics = (time_period_option, begin_date, end_date) => {
	var data = {
		time_period_option: time_period_option,
		begin_date: begin_date,
		end_date: end_date
	};

	return new Promise((resolve, reject) => {
		request.post('statistics/recipe/preview', data).then(res => {
			resolve(res.data)
		}).catch(err => {
			reject(err)
		})
	});
}

module.exports = {
	getCheckinStatistics,
	mailCheckinStatistics,
	getReservationStatistics,
	mailReservationStatistics,
	getPickupStatistics,
	currentTogoRecord,
	getRecipeStatistics
}
