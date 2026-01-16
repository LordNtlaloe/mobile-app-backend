// services/medical-services.ts
import { prisma } from "../lib/prisma";

export interface MedicalConditionData {
    condition: string;
    diagnosed?: Date;
    notes?: string;
}

export interface AllergyData {
    allergen: string;
    severity?: string;
    reaction?: string;
}

export interface MedicationData {
    name: string;
    dosage?: string;
    frequency?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
}

export interface InjuryData {
    description: string;
    injuryDate?: Date;
    recoveryDate?: Date;
    status?: string;
    notes?: string;
}

export interface FitnessGoalData {
    goal: string;
    targetDate?: Date;
    description?: string;
}

export interface DietaryRestrictionData {
    restriction: string;
    reason?: string;
    notes?: string;
}

export class MedicalService {
    // Medical Conditions
    async addMedicalCondition(clientId: string, data: MedicalConditionData) {
        return await prisma.medicalCondition.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getMedicalConditions(clientId: string) {
        return await prisma.medicalCondition.findMany({
            where: { clientId },
            orderBy: { diagnosed: 'desc' }
        });
    }

    async updateMedicalCondition(id: string, clientId: string, data: Partial<MedicalConditionData>) {
        return await prisma.medicalCondition.update({
            where: { id, clientId },
            data
        });
    }

    async deleteMedicalCondition(id: string, clientId: string) {
        return await prisma.medicalCondition.delete({
            where: { id, clientId }
        });
    }

    // Allergies
    async addAllergy(clientId: string, data: AllergyData) {
        return await prisma.allergy.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getAllergies(clientId: string) {
        return await prisma.allergy.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Medications
    async addMedication(clientId: string, data: MedicationData) {
        return await prisma.medication.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getMedications(clientId: string) {
        return await prisma.medication.findMany({
            where: { clientId },
            orderBy: { startDate: 'desc' }
        });
    }

    // Injuries
    async addInjury(clientId: string, data: InjuryData) {
        return await prisma.injury.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getInjuries(clientId: string) {
        return await prisma.injury.findMany({
            where: { clientId },
            orderBy: { injuryDate: 'desc' }
        });
    }

    // Fitness Goals
    async addFitnessGoal(clientId: string, data: FitnessGoalData) {
        return await prisma.fitnessGoal.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getFitnessGoals(clientId: string) {
        return await prisma.fitnessGoal.findMany({
            where: { clientId },
            orderBy: { targetDate: 'asc' }
        });
    }

    async markGoalAsAchieved(id: string, clientId: string) {
        return await prisma.fitnessGoal.update({
            where: { id, clientId },
            data: {
                achieved: true,
                achievedAt: new Date()
            }
        });
    }

    // Dietary Restrictions
    async addDietaryRestriction(clientId: string, data: DietaryRestrictionData) {
        return await prisma.dietaryRestriction.create({
            data: {
                clientId,
                ...data
            }
        });
    }

    async getDietaryRestrictions(clientId: string) {
        return await prisma.dietaryRestriction.findMany({
            where: { clientId }
        });
    }


    // Add these methods to your MedicalService class in medical-services.ts

    // Update methods for other entities
    async updateAllergy(id: string, clientId: string, data: Partial<AllergyData>) {
        return await prisma.allergy.update({
            where: { id, clientId },
            data
        });
    }

    async deleteAllergy(id: string, clientId: string) {
        return await prisma.allergy.delete({
            where: { id, clientId }
        });
    }

    async updateMedication(id: string, clientId: string, data: Partial<MedicationData>) {
        return await prisma.medication.update({
            where: { id, clientId },
            data
        });
    }

    async deleteMedication(id: string, clientId: string) {
        return await prisma.medication.delete({
            where: { id, clientId }
        });
    }

    async updateInjury(id: string, clientId: string, data: Partial<InjuryData>) {
        return await prisma.injury.update({
            where: { id, clientId },
            data
        });
    }

    async deleteInjury(id: string, clientId: string) {
        return await prisma.injury.delete({
            where: { id, clientId }
        });
    }

    async updateFitnessGoal(id: string, clientId: string, data: Partial<FitnessGoalData>) {
        return await prisma.fitnessGoal.update({
            where: { id, clientId },
            data
        });
    }

    async deleteFitnessGoal(id: string, clientId: string) {
        return await prisma.fitnessGoal.delete({
            where: { id, clientId }
        });
    }

    async updateDietaryRestriction(id: string, clientId: string, data: Partial<DietaryRestrictionData>) {
        return await prisma.dietaryRestriction.update({
            where: { id, clientId },
            data
        });
    }

    async deleteDietaryRestriction(id: string, clientId: string) {
        return await prisma.dietaryRestriction.delete({
            where: { id, clientId }
        });
    }

    // Bulk operations for client onboarding
    async addClientHealthInfo(clientId: string, data: {
        medicalConditions?: MedicalConditionData[];
        allergies?: AllergyData[];
        medications?: MedicationData[];
        injuries?: InjuryData[];
        fitnessGoals?: FitnessGoalData[];
        dietaryRestrictions?: DietaryRestrictionData[];
    }) {
        return await prisma.$transaction(async (tx) => {
            const results: any = {};

            if (data.medicalConditions?.length) {
                results.medicalConditions = await Promise.all(
                    data.medicalConditions.map(condition =>
                        tx.medicalCondition.create({ data: { clientId, ...condition } })
                    )
                );
            }

            if (data.allergies?.length) {
                results.allergies = await Promise.all(
                    data.allergies.map(allergy =>
                        tx.allergy.create({ data: { clientId, ...allergy } })
                    )
                );
            }

            if (data.medications?.length) {
                results.medications = await Promise.all(
                    data.medications.map(medication =>
                        tx.medication.create({ data: { clientId, ...medication } })
                    )
                );
            }

            if (data.injuries?.length) {
                results.injuries = await Promise.all(
                    data.injuries.map(injury =>
                        tx.injury.create({ data: { clientId, ...injury } })
                    )
                );
            }

            if (data.fitnessGoals?.length) {
                results.fitnessGoals = await Promise.all(
                    data.fitnessGoals.map(goal =>
                        tx.fitnessGoal.create({ data: { clientId, ...goal } })
                    )
                );
            }

            if (data.dietaryRestrictions?.length) {
                results.dietaryRestrictions = await Promise.all(
                    data.dietaryRestrictions.map(restriction =>
                        tx.dietaryRestriction.create({ data: { clientId, ...restriction } })
                    )
                );
            }

            return results;
        });
    }
}