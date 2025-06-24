from flask import Blueprint

checkin = Blueprint('checkin', __name__)

from . import views
