// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Attendance Log", {
	validate(frm) {
		const now = new Date();

		// 1. Prevent future check-in
		if (frm.doc.check_in_time) {
			const checkIn = new Date(frm.doc.check_in_time);
			if (checkIn > now) {
				frappe.msgprint("Check-in time cannot be in the future.");
				frappe.validated = false;
				return;
			}
		}

		// 2. Prevent future check-out
		if (frm.doc.check_out_time) {
			const checkOut = new Date(frm.doc.check_out_time);
			if (checkOut > now) {
				frappe.msgprint("Check-out time cannot be in the future.");
				frappe.validated = false;
				return;
			}
		}

		// 3. Check-out must be after check-in
		if (frm.doc.check_in_time && frm.doc.check_out_time) {
			const checkIn = new Date(frm.doc.check_in_time);
			const checkOut = new Date(frm.doc.check_out_time);
			if (checkOut <= checkIn) {
				frappe.msgprint("Check-out time must be later than check-in time.");
				frappe.validated = false;
				frm.set_value("check_out_time", " ");
				return;
			}
		}

		// 4. Prevent multiple check-ins per day (for new record or check-in change)
		if (
			(frm.doc.__islocal || frm.is_dirty("check_in_time")) &&
			frm.doc.member &&
			frm.doc.date
		) {
			frappe.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Attendance Log",
					filters: { member: frm.doc.member, date: frm.doc.date },
					fields: ["name"],
				},
				callback(r) {
					if (r.message && r.message.some((rec) => rec.name !== frm.doc.name)) {
						frappe.msgprint("This member has already checked in today.");
						frappe.validated = false;
					}
				},
			});
		}
	},

	check_in_time(frm) {
		if (frm.doc.check_in_time) {
			const dateOnly = frappe.datetime.get_date_part(frm.doc.check_in_time);
			frm.set_value("date", dateOnly);
		}
	},
});
