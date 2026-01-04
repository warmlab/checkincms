from datetime import datetime, date, timedelta

from flask import request, abort, make_response, jsonify

from sqlalchemy.types import Date

from ..models import MEAL_LUNCH, MEAL_SUPPER, MEAL_AFTERWARDS
from ..models import TOGO_RESERVED, TOGO_PREPARED, TOGO_TAKEN_OUT
from ..models import db, TOGO_RESERVED, Reservation, CheckInHistory, Bulletin, StaffNote

from ..utils import get_week_days
from ..myrequest import get_staff
from ..status import STATUS_TOGO_ID_INVALID, STATUS_TOGO_STATUS_INVALID
from ..status import STATUS_NOT_RESERVED, STATUS_CHECKIN_TIME_INVALID, MESSAGES

from . import api
from .base import login_required, admin_required

def checkin_status(staff_id, now=datetime.now()):
    #now = datetime.now()
    history = CheckInHistory.query.filter(CheckInHistory.staff_id==staff_id,
                                          CheckInHistory.occur_time.cast(Date) == now.date())\
                                  .order_by(CheckInHistory.occur_time.desc()).first()
    current_mode = 0
    if now.hour >= 15:
        current_mode |= MEAL_SUPPER
    else:
        current_mode |= MEAL_LUNCH # 午餐
    if history:
        if (history.mode & current_mode) > 0:
            is_checkedin = True
            is_togo = history.togo_status > 0
            togo_status = history.togo_status
        else:
            is_checkedin = False
            is_togo = False
            togo_status = 0
        id = history.id
        current_mode = history.mode
    else:
        id = 0
        current_mode = 0
        is_checkedin = False
        is_togo = False
        togo_status = 0

    return {"id":id, "is_checkedin":is_checkedin, "checkin_status":current_mode, "is_togo":is_togo, "togo_status":togo_status}

def this_week_reservation_status(staff_id):
    today = datetime.today()
    this_week_days = get_week_days()
    reservations = Reservation.query.filter(Reservation.staff_id==staff_id, Reservation.reservation>0,
                                            Reservation.occur_time.cast(Date) >= this_week_days[0],
                                            Reservation.occur_time.cast(Date) <= this_week_days[-1]).all()
    if reservations:
        reserved = True
    else:
        reserved = False

    if (today.weekday() == 5 and today.hour >=12) or\
        today.weekday() > 5: # 食材预约截止时间为每周六中午12:00
        can_reserve = False
    else:
        can_reserve = True

    return {"reserved": reserved, "can_reserve": can_reserve}

@api.route('/checkin/prepare', methods=['GET'])
@login_required
def checkin_prepare():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))

    status = checkin_status(staff.id)
    status.update(this_week_reservation_status(staff.id)) # 获取当前食材预约状态
    #status.update({"reserved": False, "can_reserve": True}) # 获取当前食材预约状态

    return jsonify(status), 200

@api.route('/togo/takeout', methods=['POST'])
@login_required
def togo_takeout():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    info = request.json
    try:
        id = info.get('togo_id')
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_TOGO_ID_INVALID, message=MESSAGES[STATUS_TOGO_ID_INVALID]), 400))

    history = CheckInHistory.query.get(id)
    if history.staff_id != staff.id:
        abort(make_response(jsonify(errcode=STATUS_TOGO_ID_INVALID, message=MESSAGES[STATUS_TOGO_ID_INVALID]), 400))

    if not history or history.staff_id != staff.id:
        abort(make_response(jsonify(errcode=STATUS_TOGO_ID_INVALID, message=MESSAGES[STATUS_TOGO_ID_INVALID]), 400))

    if (history.togo_status & TOGO_RESERVED) != TOGO_RESERVED:
        abort(make_response(jsonify(errcode=STATUS_TOGO_STATUS_INVALID, message=MESSAGES[STATUS_TOGO_STATUS_INVALID]), 400))

    history.togo_status |= TOGO_TAKEN_OUT | TOGO_PREPARED
    db.session.commit()

    return jsonify(checkin_status(staff.id)), 200
    
def checkin_prepare2():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    today = datetime.today()
    this_week_days = get_week_days()
    histories = CheckInHistory.query.filter(CheckInHistory.staff_id==staff.id,
                                            CheckInHistory.occur_time >= this_week_days[0],
                                            CheckInHistory.occur_time <= this_week_days[-1])\
                                    .order_by(CheckInHistory.occur_time.desc()).all()
    dates = [history.occur_time.date() for history in histories]
    day_checks = []
    for index, day in enumerate(this_week_days, start=1):
        if day not in dates:
            if day > today.date():
                day_check = {'index': index, 'date': day, 'status': 3} # future time
            elif day ==  today.date():
                day_check = {'index': index, 'date': day, 'status': 2} # today, not checked in
            else:
                day_check = {'index': index, 'date': day, 'status': 0} # past time but not checked in
        else:
            day_check = {'index': index, 'date': day, 'status': 1} # already checked in
        day_checks.append(day_check)

    reservations = Reservation.query.filter(Reservation.staff_id==staff.id, Reservation.reservation>0,
                                            Reservation.occur_time.cast(Date) >= this_week_days[0],
                                            Reservation.occur_time.cast(Date) <= this_week_days[-1]).all()
    if reservations:
        reservation = True
    else:
        if (today.weekday() == 5 and today.hour >=12) or\
            today.weekday() > 5: # 食材预约截止时间为每周六中午12:00
            reservation = True
        else:
            reservation = False

    bulletins = Bulletin.query.filter(Bulletin.begin_date.cast(Date)<=today.date(), Bulletin.end_date.cast(Date)>=today.date()).all()

    return jsonify({'status': day_checks, 'reservation': reservation, 'today': int(today.timestamp()),
                    'bulletins': [b.to_json() for b in bulletins]}), 200

@api.route('/checkin/action', methods=['POST'])
@login_required
def checkin_action():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    today = datetime.today()

    try:
        checkin_time = request.json.get('checkin_time')
        print(checkin_time)
        if not checkin_time:
            checkin_time = datetime.now()
        else:
            checkin_time = datetime.fromtimestamp(int(checkin_time))
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_CHECKIN_TIME_INVALID, message=MESSAGES[STATUS_CHECKIN_TIME_INVALID]), 400))

    print(checkin_time)
    history = CheckInHistory.query.filter(CheckInHistory.staff_id==staff.id,
                                          CheckInHistory.occur_time.cast(Date)==checkin_time.date())\
                                  .order_by(CheckInHistory.occur_time.desc()).first()
    if not history:
        history = CheckInHistory()
        history.staff_id = staff.id
        history.mode = 0
        history.togo_status = 0
        history.occur_time = checkin_time # just occur in first time
        #history.note = ""
        db.session.add(history)

    note = request.json.get('note')
    if note:
        sn = StaffNote()
        sn.content = note.strip()
        sn.staff_id = staff.id
        db.session.add(sn)

    togo = request.json.get('is_togo')
    if togo:
        history.togo_status |= TOGO_RESERVED
        # TODO 此时应该生成一个task，提醒管理员有人打包了
    #history.occur_time = checkin_time
    if checkin_time.hour >= 15:
        history.mode |= MEAL_SUPPER
    else:
        history.mode |= MEAL_LUNCH # 午餐

    if checkin_time.date() != today.date(): # 对补打卡的区分
        history.mode |= MEAL_AFTERWARDS

    db.session.commit()

    # 处理预约食材
    reservation = request.json.get('reservation')
    if reservation:
        make_reservation(staff.id)

    #return jsonify(history=history.to_json(), checkin_time_index=checkin_time.weekday(), reservation=reserved), 201
    #return jsonify(history=history.to_json()), 201
    status = checkin_status(staff.id, checkin_time)
    status.update(this_week_reservation_status(staff.id))

    return jsonify(status), 201

@api.route('/togo/action', methods=['POST'])
@login_required
def togo_action():
    info = request.json
    try:
        id = info.get('togo_id')
        index = info.get('index')
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_TOGO_ID_INVALID, message=MESSAGES[STATUS_TOGO_ID_INVALID]), 400))

    history = CheckInHistory.query.get(id)
    if not history:
        abort(make_response(jsonify(errcode=STATUS_TOGO_ID_INVALID, message=MESSAGES[STATUS_TOGO_ID_INVALID]), 400))

    status = history.togo_status
    if status == TOGO_RESERVED:
        history.togo_status |= TOGO_PREPARED
    elif status == (TOGO_RESERVED | TOGO_PREPARED):
        history.togo_status |= TOGO_TAKEN_OUT
    else:
        abort(make_response(jsonify(errcode=STATUS_TOGO_STATUS_INVALID, message=MESSAGES[STATUS_TOGO_STATUS_INVALID]), 400))

    db.session.commit()

    result = history.to_json()
    result['index'] = index

    return jsonify(result), 200

@api.route('/reservation/latest', methods=['GET'])
@login_required
def reservation_latest():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))

    return jsonify(reservation_status(staff.id)), 200

def reservation_status2(staff_id):
    last_week_days = get_week_days(-1)
    this_week_days = get_week_days()
    result = {}
    last_week_reservation = Reservation.query.filter(Reservation.staff_id==staff_id, Reservation.occur_time.cast(Date) >= last_week_days[0], Reservation.occur_time.cast(Date) <= last_week_days[-1]).first()
    if last_week_reservation:
        result['last_week'] = {'reserved': True,  'time': last_week_reservation.occur_time.date()} 
        if last_week_reservation.pickup_time:
            result['last_week']['pickedup'] = True
            result['last_week']['pickedup_time'] = last_week_reservation.pickup_time
        else:
            result['last_week']['pickedup'] = False
    else:
        result['last_week'] = {'reserved': False}

    this_week_reservation = Reservation.query.filter(Reservation.staff_id==staff_id, Reservation.occur_time.cast(Date) >= this_week_days[0], Reservation.occur_time.cast(Date) <= this_week_days[-1]).first()
    if this_week_reservation:
        result['this_week'] = {'reserved': True,  'time': this_week_reservation.occur_time.date()}
    else:
        result['this_week'] = {'reserved': False}

    today = datetime.today()
    if (today.weekday() == 5 and today.hour >= 12) or\
        today.weekday() > 5: # 食材预约截止时间为每周六中午12:00
        result['can_reserve'] = False
    else:
        result['can_reserve'] = True

    return result


def reservation_status(staff_id):
    this_week_days = get_week_days()
    result = {}

    this_week_reservation = Reservation.query.filter(Reservation.staff_id==staff_id, Reservation.occur_time.cast(Date) >= this_week_days[0], Reservation.occur_time.cast(Date) <= this_week_days[-1]).first()
    if this_week_reservation:
        result['this_week'] = {'reserved': True,  'time': this_week_reservation.occur_time.date()}
        if this_week_reservation.pickup_time:
            result['this_week']['pickedup'] = True
            result['this_week']['pickedup_time'] = this_week_reservation.pickup_time
        else:
            result['this_week']['pickedup'] = False
    else:
        result['this_week'] = {'reserved': False}

    today = datetime.today()
    if (today.weekday() == 2 and today.hour >= 8) or today.weekday() > 2: # 食材预约截止时间为每周三上午8:00
        result['can_reserve'] = False
    else:
        result['can_reserve'] = True

    return result
    

@api.route('/reservation/new', methods=['POST'])
@login_required
def new_reservation():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))

    make_reservation(staff.id)

    return jsonify(reservation_status(staff.id)), 201

@api.route('/reservation/cancel', methods=['POST'])
@login_required
def cancel_reservation():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))

    this_week_days = get_week_days()
    reservation = Reservation.query.filter(Reservation.staff_id==staff.id,
                                        Reservation.occur_time.cast(Date)>=this_week_days[0],
                                        Reservation.occur_time.cast(Date)<=this_week_days[-1]).first()
    #if reservation:
    #    reserved = True
    #else:
    #    reserved = False

    #reserve = request.json.get('reservation')
    #if reserve:
    if reservation:
        db.session.delete(reservation)
    db.session.commit()

    return jsonify(reservation_status(staff.id)), 201

def make_reservation(staff_id):
    this_week_days = get_week_days()
    reservation = Reservation.query.filter(Reservation.staff_id==staff_id,
                                        Reservation.occur_time.cast(Date)>=this_week_days[0],
                                        Reservation.occur_time.cast(Date)<=this_week_days[-1]).first()
    #if reservation:
    #    reserved = True
    #else:
    #    reserved = False

    #reserve = request.json.get('reservation')
    #if reserve:
    if not reservation:
        reservation = Reservation()
        reservation.staff_id = staff_id
        reservation.reservation = 1 # 预约下周食材
        #reservation.occur_time = checkin_time
        db.session.add(reservation)
    else:
        reservation.reservation += 1
        #reserved = True
    db.session.commit()

@api.route('/reservation/pickup', methods=['POST'])
@login_required
def reservation_pickup():
    staff = get_staff(request.headers.get('X-ACCESS-TOKEN'))
    last_week_days = get_week_days(-1)

    reservations = Reservation.query.filter(Reservation.staff_id==staff.id, Reservation.occur_time.cast(Date) >= last_week_days[0], Reservation.occur_time.cast(Date) <= last_week_days[-1]).all()
    if not reservations:
        abort(make_response(jsonify(errcode=STATUS_NOT_RESERVED, message=MESSAGES[STATUS_NOT_RESERVED]), 404)) # not found any reservation

    for reservation in reservations:
        reservation.pickup_time = datetime.now()
        reservation.update_time = datetime.now()

    db.session.commit()

    #return jsonify({'pickedup': True, 'time': reservations[0].pickup_time}), 201
    return jsonify(reservation_status(staff.id)), 201
