from datetime import datetime, date

from flask import render_template, abort, request

from ..models import Company, Staff, CheckInHistory, Reservation
from ..models import db

from .. import myfilters
from ..utils import get_week_days

from . import checkin

@checkin.route('/tosignup', methods=['GET'])
def to_signup():
    companies = Company.query.all()
    today = datetime.today()
    return render_template('checkin/to_signup.html', companies=companies, today=today)

@checkin.route('/signup', methods=['POST'])
def signup():
    companies = Company.query.all()
    today = datetime.today()
    return render_template('checkin/signedup.html', companies=companies, today=today)

@checkin.route('/tocheckin', methods=['GET'])
def to_checkin():

    # TODO BEGIN Just for test
    from random import randint
    staff_id = 2 #randint(1, 10)

    #TODO END
    #companies = Company.query.all()
    #companies = [c.to_json() for c in companies]
    today = datetime.today()
    this_week_days = get_week_days()
    reservations = Reservation.query.filter(Reservation.occur_time >= this_week_days[0], Reservation.occur_time <= today, Reservation.staff_id==staff_id).all()
    if not reservations:
        reservation = False
    else:
        if (today.weekday() == 5 and today.hour >=12) or\
            today.weekday() > 5: # 食材预约截止时间为每周六中午12:00
            reservation = False
        else:
            reservation = True

    return render_template('checkin/to_checkin.html', today=today, reservation=reservation)

@checkin.route('/checkin', methods=['POST'])
def checkingin():
    # TODO BEGIN Just for test
    from random import randint
    staff_id = 2 # randint(1, 10)

    mode = randint(1,2)
    #TODO END

    staff = Staff.query.get_or_404(staff_id)

    note = request.form.get('note')
    reservation = request.form.get('reservation')
    history = CheckInHistory()
    history.staff = staff
    history.note = note
    history.mode = mode

    if reservation and reservation == 'on':
        app = Reservation()
        app.staff = staff
        app.reservation = 1 # 预约下周食材
        db.session.add(app)

    db.session.add(history)
    db.session.commit()

    today = datetime.today()

    return render_template('checkin/checkedin.html', today=today)

@checkin.route('/myrecords', methods=['GET'])
def records():
    # TODO BEGIN Just for test
    from random import randint
    staff_id = randint(1, 10)

    mode = randint(1,2)
    #TODO END

    this_week_days = get_week_days()
    histories = CheckInHistory.query.filter(CheckInHistory.occur_time >= this_week_days[0], CheckInHistory.occur_time <= this_week_days[-1])\
                                    .order_by(CheckInHistory.occur_time.desc()).all()
    dates = [history.occur_time.date() for history in histories]
    for day in this_week_days:
        if day not in dates:
            ch = CheckInHistory()
            ch.occur_time = datetime.combine(day, datetime.min.time())
            ch.mode = 0
            histories.append(ch)
            dates.append(day)
    return render_template('checkin/myrecords.html', histories=histories, this_week_days=this_week_days, today=date.today())

@checkin.route('/toraffle', methods=['GET'])
def to_raffle():
    return render_template('checkin/raffle.html')
