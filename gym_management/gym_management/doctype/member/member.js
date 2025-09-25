// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Member", {
	refresh(frm) {
		// Set default status if empty
		if (!frm.doc.status) {
			frm.set_value("status", "Active");
		}
	},

	// When membership_type changes
	membership_type(frm) {
		calculateExpiry(frm);
	},

	// When joining_date changes
	joining_date(frm) {
		calculateExpiry(frm);
	},

	// when date of birth changes
	date_of_birth(frm) {
		calculateAge(frm);
	},
});

// Helper function to calculate expiry
function calculateExpiry(frm) {
	if (frm.doc.membership_type && frm.doc.joining_date) {
		frappe.call({
			method: "frappe.client.get",
			args: {
				doctype: "Membership",
				name: frm.doc.membership_type,
			},
			callback: function (r) {
				if (r.message) {
					let months = r.message.duration; // duration in months
					let expiry = frappe.datetime.add_months(frm.doc.joining_date, months);
					frm.set_value("expiry_date", expiry);
				}
			},
		});
	}
}

function calculateAge(frm) {
	if (frm.doc.date_of_birth) {
		let today = new Date();
		let birthDate = new Date(frm.doc.date_of_birth);
		let age = today.getFullYear() - birthDate.getFullYear();
		let m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		frm.set_value("age", age);
	}
}
