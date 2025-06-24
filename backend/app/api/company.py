from uuid import uuid4

from flask import request, abort, make_response, jsonify
from sqlalchemy import or_

from . import api
from .base import login_required, admin_required

from ..models import db, Company
from ..status import STATUS_COMPANY_ID_INVALID, STATUS_COMPANY_NAME_INVALID, MESSAGES

@api.route('company/info', methods=['GET'])
@admin_required
def company_info():
    company_id = request.args.get('company_id')
    company = Company.query.get_or_404(company_id)

    return jsonify(company.to_json()), 200

@api.route('company/update', methods=['POST', 'DELETE'])
@admin_required
def company_update():
    info = request.json
    company_id = info.get('id')
    try:
        company_id = int(company_id)
    except Exception as e:
        abort(make_response(jsonify(errcode=STATUS_COMPANY_ID_INVALID, message=MESSAGES[STATUS_COMPANY_ID_INVALID]), 400))

    if request.method == 'POST':
        if company_id <= 0:
            company = Company()
            company.code = uuid4().hex
            db.session.add(company)
        else:
            company = Company.query.get_or_404(company_id)
        name = info.get('name')
        if not name:
            abort(make_response(jsonify(errcode=STATUS_COMPANY_NAME_INVALID, message=MESSAGES[STATUS_COMPANY_NAME_INVALID]), 400))
        company.name = name
    elif request.method == 'DELETE':
        company = Company.query.get_or_404(company_id)
        company.is_deleted = True

    db.session.commit()

    return jsonify(company.to_json()), 200

@api.route('companies/info', methods=['GET'])
@login_required
def companies_info():
    companies = Company.query.filter(or_(Company.is_deleted==None, Company.is_deleted==False)).order_by(Company.id)

    r = [c.to_json() for c in companies]
    return jsonify(r), 200
