from typing import List

from datetime import date, timedelta

def get_week_days(week: int = 0) -> List[date]:
    day = date.today() + timedelta(days=7 * week)
    weekday = day.weekday()
    start_of_week = day - timedelta(days=weekday)
    
    days_of_week = [start_of_week + timedelta(days=i) for i in range(7)]
    
    return days_of_week

def get_days(begin_date: date, end_date: date) -> List[date]:
    if end_date < begin_date:
        return []

    return [begin_date + timedelta(days=i) for i in range((end_date - begin_date).days + 1)]


# Example usage
#current_week_days = get_current_week_days()
#for day in current_week_days:
#    print(day.strftime("%A, %Y-%m-%d"))