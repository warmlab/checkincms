from typing import List
from datetime import datetime, date
from io import BytesIO

from flask import render_template, abort, request
from flask import jsonify

from flask_mail import Message

from ..models import Company, Staff, CheckInHistory
from ..models import db

from .. import myfilters, mail
from ..utils import get_week_days, get_days

from . import admin

@admin.route('/records/to_generate', methods=['GET'])
def to_generate_records():
    companies = Company.query.all()
            
    return render_template('admin/checkin/records.html', companies=companies)

@admin.route('/records/preview', methods=['POST'])
def checkin_records_preview():
    data = request.json
    row_header, records, total_checkin, total_person = parse_data_from_client(data)
    """
    time_period_option = data.get('time_period_option').strip()
    row_header = ['#', '姓名', '公司']
    time_period = []
    if not time_period_option:
        time_period_option = 1
    else:
        time_period_option = int(time_period_option)

    if time_period_option == 1 or time_period_option == 2:
        time_period = get_week_days(1-time_period_option)
        row_header.extend(myfilters.week_short_name_list)
    else:
        begin_date = data.get('begin_date')
        end_date = data.get('end_date')
        if begin_date is None or end_date is None:
            time_period = []
        else:
            time_period = get_days(begin_date, end_date);
            row_header.extend(time_period)
    
    company_id = data.get('company_id')
    try:
        company_id = int(company_id)
    except Exception as e:
        company_id = 0
    staffs, days, total_checkin, total_person = generate_records(time_period, company_id)
    """
    return jsonify({'total_checkin': total_checkin, 'total_person': total_person, 'records': records, 'header': row_header}), 200

@admin.route('/records/email', methods=['POST'])
def checkin_records_email():
    form = request.form
    row_header, records, total_checkin, total_person = parse_data_from_client(form)

    ## to generate excel file
    bytesIO = BytesIO()
    #excel_checkin_record(bytesIO, row_header, records, [['签到总人数', total_person, '总人数', len(records)], ['签到总次数', total_checkin]])
    message = Message(subject='签到统计表', sender='warmlab@outlook.com', recipients=['warmlab@outlook.com'])
    if len(row_header) > 3:
        message.body = "您好，附件中包含了从{}到{}日的签到信息。".format(row_header[3], row_header[-1])
    else:
        message.body = "您好，附件中包含了一些签到信息。".format(row_header[3], row_header[-1])
    message.attach("checkin.xlsx", "application/vnd.ms-excel", bytesIO.getvalue())
    mail.send(message)


def parse_data_from_client(data):
    #row_header = ['seq', 'name']
    row_header = ['#', '姓名', '公司']
    time_period = []
    time_period_option = data.get('time_period_option')
    try:
        time_period_option = int(time_period_option)
    except Exception as e:
        time_period_option = 1

    if time_period_option == 1 or time_period_option == 2:
        time_period = get_week_days(1-time_period_option)
        row_header.extend(myfilters.week_short_name_list)
    else:
        begin_date = data.get('begin_date')
        end_date = data.get('end_date')
        if begin_date is None or end_date is None:
            time_period = []
        else:
            time_period = get_days(begin_date, end_date)
            row_header.extend(time_period)
    
    company_id = data.get('company_id')
    try:
        company_id = int(company_id)
    except Exception as e:
        company_id = 0

    return generate_records(time_period, company_id)

def generate_records(time_period: List[date], company_id: int):
    total_person = 0
    total_checkin = 0
    row_header = ['#', '姓名', '公司']
    #row_header.extend(time_period)
    for day in time_period:
        row_header.append(day.strftime('%Y/%m/%d %a'))

    if not company_id:
        staffs = Staff.query.all()
    else:
        staffs = Staff.query.filter_by(company_id=company_id)

    if not time_period:
        return [], [], 0, 0

    records = []
    for index, staff in enumerate(staffs, start=1):
        histories = CheckInHistory.query\
                        .filter(CheckInHistory.staff_id==staff.id, CheckInHistory.occur_time >= time_period[0],
                                CheckInHistory.occur_time <= time_period[-1]).all()
        date_modes = {history.occur_time.date():history.mode for history in histories}
        dates = {}
        for history in histories:
            d = history.occur_time.date()
            if d not in dates:
                dates[d] = history.mode
                total_checkin += 1
            else:
                dates[d] |= history.mode

        record = [index, staff.last_name + staff.first_name, staff.company.name]
        for day in time_period:
            if day in dates:
                record.append(date_modes[day])
                total_person += 1
            else:
                record.append(0)

        records.append(record)

    return row_header, records, total_checkin, total_person
