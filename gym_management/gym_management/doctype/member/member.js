// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Member", {
	refresh(frm) {
		// Set default status if empty
		if (!frm.doc.status) {
			frm.set_value("status", "Active");
		}
		if (!frm.doc.__islocal) {
			addCustomButton(frm);
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

	// Form validation
	validate(frm) {
		// Validate Email
		if (frm.doc.email) {
			let email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!email_regex.test(frm.doc.email)) {
				frappe.msgprint("Please enter a valid email address.");
				frappe.validated = false; // Stop form submission
			}
		}

		// Validate Phone
		if (frm.doc.phone) {
			let phone_regex = /^[0-9]{10}$/; // Example: 10-digit number
			if (!phone_regex.test(frm.doc.phone)) {
				frappe.msgprint("Please enter a valid 10-digit phone number.");
				frappe.validated = false; // Stop form submission
			}
		}
	},
});

function addCustomButton(frm) {
	frm.add_custom_button("Assign Trainer", () => {
		let d = new frappe.ui.Dialog({
			title: "Assign Trainer",
			fields: [
				{
					fieldname: "trainer",
					fieldtype: "Link",
					options: "Trainer",
					label: "Select Trainer",
					reqd: 1,
				},
			],
			primary_action_label: "Assign",
			primary_action(values) {
				// Set the selected trainer in Member form
				frm.set_value("assigned_trainer", values.trainer);

				// Save the form
				frm.save().then(() => {
					frappe.msgprint(`Trainer ${values.trainer} assigned successfully!`);
					d.hide(); // Close dialog
				});
			},
		});

		d.show(); // Display the dialog
	}).addClass("btn-primary");
}

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

// Helper function to calculate age
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
	} else {
		frm.set_value("age", null);
	}
}
