from datetime import datetime, date
from flask import request, jsonify, abort, make_response

from ..models import CheckInHistory, Reservation
from ..utils import get_week_days, get_days
from ..myrequest import get_staff

from ..status import STATUS_REQUIRED_ARG_INVALID, MESSAGES

from . import api
from .base import login_required, admin_required

@api.route('/record/checkin', methods=['GET'])
@login_required
def checkin_records():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    time_period_option = request.args.get('time_period_option')
    try:
        time_period_option = int(time_period_option)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID] % "time_period_option"), 400)) # bad request

    today = date.today()
    if time_period_option == 1 or time_period_option== 2:
        these_days = get_week_days(1-time_period_option)
    else:
        begin_date = request.args.get('begin_date')
        end_date = request.args.get('end_date')
        try:
            begin_date = date.fromisoformat(begin_date)
            end_date = date.fromisoformat(end_date)
        except Exception as e:
            abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID] % "begin date or end date"), 400)) # bad response

        these_days = get_days(begin_date, end_date)
    histories = CheckInHistory.query.filter(CheckInHistory.staff_id==staff.id, CheckInHistory.occur_time >= these_days[0], CheckInHistory.occur_time <= these_days[-1])\
                                    .order_by(CheckInHistory.occur_time.desc()).all()
    dates = [history.occur_time.date() for history in histories]
    day_checks = []
    for index, day in enumerate(these_days, start=1):
        if day not in dates:
            if day > today:
                day_check = {'index': index, 'year': day.year, 'month': day.month, 'day': day.day, 'status': 3} # future time
            elif day ==  today:
                day_check = {'index': index, 'year': day.year, 'month': day.month, 'day': day.day, 'status': 2} # today, not checked in
            else:
                day_check = {'index': index, 'year': day.year, 'month': day.month, 'day': day.day, 'status': 0} # past time but not checked in
        else:
            day_check = {'index': index, 'year': day.year, 'month': day.month, 'day': day.day, 'status': 1} # already checked in
        day_checks.append(day_check)

    return jsonify(day_checks), 200


@api.route('/record/reservation', methods=['GET'])
@login_required
def reservation_records():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))

@api.route('/record/pickup', methods=['GET'])
@login_required
def pickup_records():
    pass
