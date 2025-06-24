import json

from datetime import datetime

from flask import request, abort, make_response, jsonify
from sqlalchemy.types import Date

from ..models import StaffNote, Staff
from ..utils import get_week_days
from ..status import STATUS_REQUIRED_ARG_INVALID, MESSAGES

from . import api
from .base import login_required, admin_required

@api.route('notes/info', methods=['GET'])
@admin_required
def note_list():
    data = request.args

    time_period_option = data.get('time_period_option')
    try:
        time_period_option = int(time_period_option)
    except Exception as e:
        time_period_option = 1

    if time_period_option == 1 or time_period_option == 2:
        time_period = get_week_days(1-time_period_option)
        begin_date = time_period[0]
        end_date = time_period[-1]
    else:
        begin_date = data.get('begin_date')
        end_date = data.get('end_date')
        if not begin_date or not end_date:
            abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID]), 400))
        else:
            try:
                begin_date = datetime.strptime(begin_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                if begin_date > end_date:
                    abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID]), 400))
            except Exception as e:
                abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID]), 400))
            #time_period = get_days(begin_date, end_date)
    company_ids = json.loads(data.get('companies'))
    staffs = Staff.query.filter(Staff.company_id.in_(company_ids))
    staff_ids = [s.id for s in staffs]

    notes = StaffNote.query.filter(StaffNote.staff_id.in_(staff_ids), StaffNote.occur_time.cast(Date)<=end_date, StaffNote.occur_time.cast(Date)>=begin_date)\
                           .order_by(StaffNote.occur_time.desc()).all()

    return jsonify([n.to_json() for n in notes]), 200

@api.route('note/info', methods=['GET'])
@admin_required
def note_info():
    note_id = request.args.get('note_id')
    try:
        note_id = int(note_id)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_REQUIRED_ARG_INVALID, message=MESSAGES[STATUS_REQUIRED_ARG_INVALID]), 400))

    note = StaffNote.query.get_or_404(note_id)

    return jsonify(note.to_json()), 200
