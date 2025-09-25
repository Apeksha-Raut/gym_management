// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Attendance Log", {
	validate(frm) {
		// 1. Prevent future check-in
		if (frm.doc.check_in_time) {
			let now = new Date();
			let checkIn = new Date(frm.doc.check_in_time);
			if (checkIn > now) {
				frappe.msgprint("Check-in time cannot be in the future.");
				frappe.validated = false;
				return;
			}
		}

		// 2. Prevent multiple check-ins for the same member on the same date
		if (frm.doc.member && frm.doc.date) {
			frappe.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Attendance Log",
					filters: {
						member: frm.doc.member,
						date: frm.doc.date,
					},
					fields: ["name"],
				},
				callback(r) {
					if (r.message && r.message.length > 0 && !frm.doc.__islocal) {
						frappe.msgprint("This member has already checked in today.");
						frappe.validated = false;
					}
				},
			});
		}
	},

	check_in_time(frm) {
		// Auto-set date from check-in time
		if (frm.doc.check_in_time) {
			let dateOnly = frappe.datetime.get_date_part(frm.doc.check_in_time);
			frm.set_value("date", dateOnly);
		}
	},
});
