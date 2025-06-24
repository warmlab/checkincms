from jinja2 import filters

from datetime import datetime, date

week_name_list = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"]
week_short_name_list = ["周一","周二","周三","周四","周五","周六","周日"]

def chinese_format_date(value) -> str:
    if isinstance(value, datetime) or isinstance(value, date):
        return value.strftime("%Y年%m月%d日") + week_name_list[value.weekday()]
    else:
        today = datetime.today()
        return today.strftime("%Y年%m月%d日") + week_name_list[today.weekday()]

def chinese_short_format_date(value) -> str:
    if isinstance(value, datetime) or isinstance(value, date):
        return value.strftime("%m月%d日 ") + week_short_name_list[value.weekday()]
    else:
        today = datetime.today()
        return today.strftime("%m月%d日 ") + week_short_name_list[today.weekday()]

def week_name(value) -> str:
    if value < 0 or value > 6:
        return ""
    else:
        return week_name_list[value]

filters.FILTERS["chinese_format_date"] = chinese_format_date
filters.FILTERS["chinese_short_format_date"] = chinese_short_format_date
filters.FILTERS["week_name"] = week_name
