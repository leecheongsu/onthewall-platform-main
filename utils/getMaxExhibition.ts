import { PaymentType } from '@/type/Payment';
import { PAYMENT } from '../constants/payment';

function getMaxExhibitionByValue(value: PaymentType): number | null {
	// Iterate through each plan in the PAYMENT object
	for (const planKey in PAYMENT) {
		const plan = PAYMENT[planKey];

		if (plan.hasGrade) {
			const grade = plan.grades.find(grade => grade.value === value);
			if (grade) {
				return grade.maxExhibition;
			}
		} else {
			if (plan.value === value) {
				return plan.maxExhibition;
			}
		}
	}
	// If no matching value is found, return null
	return null;
}

export default getMaxExhibitionByValue;
