# Copyright (c) 2025, Apeksha Raut and contributors
# For license information, please see license.txt


import frappe
from frappe.utils import getdate, flt
from datetime import datetime

import frappe

def execute(filters=None):
    if filters is None:
        filters = {}

    # 1. Define columns
    columns = [
        {"label": "Member ID", "fieldname": "member", "fieldtype": "Link", "options": "Member", "width": 150},
        {"label": "Member Name", "fieldname": "member_name", "fieldtype": "Data", "width": 200},
        {"label": "Date", "fieldname": "date", "fieldtype": "Date", "width": 100},
        {"label": "Check In", "fieldname": "check_in_time", "fieldtype": "Datetime", "width": 200},
        {"label": "Check Out", "fieldname": "check_out_time", "fieldtype": "Datetime", "width": 200},
        {"label": "Session Duration (HH:MM)", "fieldname": "session_duration_hm", "fieldtype": "Data", "width": 200}
    ]

    # 2. Build conditions
    conditions = []
    if filters.get("member"):
        conditions.append(f"al.member = '{filters.get('member')}'")
    if filters.get("from_date"):
        conditions.append(f"al.date >= '{filters.get('from_date')}'")
    if filters.get("to_date"):
        conditions.append(f"al.date <= '{filters.get('to_date')}'")

    condition_sql = " AND ".join(conditions)
    if condition_sql:
        condition_sql = "WHERE " + condition_sql

    # 3. Fetch attendance logs with member name
    attendance_logs = frappe.db.sql(f"""
        SELECT 
            al.member, 
            m.member_name, 
            al.date, 
            al.check_in_time, 
            al.check_out_time
        FROM `tabAttendance Log` al
        LEFT JOIN `tabMember` m ON al.member = m.name
        {condition_sql}
        ORDER BY al.date DESC, al.check_in_time DESC
    """, as_dict=True)

    # 4. Prepare data with session duration
    data = []
    for log in attendance_logs:
        duration_hm = ""
        if log.check_in_time and log.check_out_time:
            delta = log.check_out_time - log.check_in_time
            total_minutes = int(delta.total_seconds() // 60)
            hours = total_minutes // 60
            minutes = total_minutes % 60
            duration_hm = f"{hours:02d}:{minutes:02d}"

        log["session_duration_hm"] = duration_hm
        data.append(log)

    return columns, data
