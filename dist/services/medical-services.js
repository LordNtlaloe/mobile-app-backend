"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalService = void 0;
const prisma_1 = require("../lib/prisma");
class MedicalService {
    async addMedicalCondition(clientId, data) {
        return await prisma_1.prisma.medicalCondition.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getMedicalConditions(clientId) {
        return await prisma_1.prisma.medicalCondition.findMany({
            where: { clientId },
            orderBy: { diagnosed: 'desc' }
        });
    }
    async updateMedicalCondition(id, clientId, data) {
        return await prisma_1.prisma.medicalCondition.update({
            where: { id, clientId },
            data
        });
    }
    async deleteMedicalCondition(id, clientId) {
        return await prisma_1.prisma.medicalCondition.delete({
            where: { id, clientId }
        });
    }
    async addAllergy(clientId, data) {
        return await prisma_1.prisma.allergy.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getAllergies(clientId) {
        return await prisma_1.prisma.allergy.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addMedication(clientId, data) {
        return await prisma_1.prisma.medication.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getMedications(clientId) {
        return await prisma_1.prisma.medication.findMany({
            where: { clientId },
            orderBy: { startDate: 'desc' }
        });
    }
    async addInjury(clientId, data) {
        return await prisma_1.prisma.injury.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getInjuries(clientId) {
        return await prisma_1.prisma.injury.findMany({
            where: { clientId },
            orderBy: { injuryDate: 'desc' }
        });
    }
    async addFitnessGoal(clientId, data) {
        return await prisma_1.prisma.fitnessGoal.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getFitnessGoals(clientId) {
        return await prisma_1.prisma.fitnessGoal.findMany({
            where: { clientId },
            orderBy: { targetDate: 'asc' }
        });
    }
    async markGoalAsAchieved(id, clientId) {
        return await prisma_1.prisma.fitnessGoal.update({
            where: { id, clientId },
            data: {
                achieved: true,
                achievedAt: new Date()
            }
        });
    }
    async addDietaryRestriction(clientId, data) {
        return await prisma_1.prisma.dietaryRestriction.create({
            data: {
                clientId,
                ...data
            }
        });
    }
    async getDietaryRestrictions(clientId) {
        return await prisma_1.prisma.dietaryRestriction.findMany({
            where: { clientId }
        });
    }
    async updateAllergy(id, clientId, data) {
        return await prisma_1.prisma.allergy.update({
            where: { id, clientId },
            data
        });
    }
    async deleteAllergy(id, clientId) {
        return await prisma_1.prisma.allergy.delete({
            where: { id, clientId }
        });
    }
    async updateMedication(id, clientId, data) {
        return await prisma_1.prisma.medication.update({
            where: { id, clientId },
            data
        });
    }
    async deleteMedication(id, clientId) {
        return await prisma_1.prisma.medication.delete({
            where: { id, clientId }
        });
    }
    async updateInjury(id, clientId, data) {
        return await prisma_1.prisma.injury.update({
            where: { id, clientId },
            data
        });
    }
    async deleteInjury(id, clientId) {
        return await prisma_1.prisma.injury.delete({
            where: { id, clientId }
        });
    }
    async updateFitnessGoal(id, clientId, data) {
        return await prisma_1.prisma.fitnessGoal.update({
            where: { id, clientId },
            data
        });
    }
    async deleteFitnessGoal(id, clientId) {
        return await prisma_1.prisma.fitnessGoal.delete({
            where: { id, clientId }
        });
    }
    async updateDietaryRestriction(id, clientId, data) {
        return await prisma_1.prisma.dietaryRestriction.update({
            where: { id, clientId },
            data
        });
    }
    async deleteDietaryRestriction(id, clientId) {
        return await prisma_1.prisma.dietaryRestriction.delete({
            where: { id, clientId }
        });
    }
    async addClientHealthInfo(clientId, data) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const results = {};
            if (data.medicalConditions?.length) {
                results.medicalConditions = await Promise.all(data.medicalConditions.map(condition => tx.medicalCondition.create({ data: { clientId, ...condition } })));
            }
            if (data.allergies?.length) {
                results.allergies = await Promise.all(data.allergies.map(allergy => tx.allergy.create({ data: { clientId, ...allergy } })));
            }
            if (data.medications?.length) {
                results.medications = await Promise.all(data.medications.map(medication => tx.medication.create({ data: { clientId, ...medication } })));
            }
            if (data.injuries?.length) {
                results.injuries = await Promise.all(data.injuries.map(injury => tx.injury.create({ data: { clientId, ...injury } })));
            }
            if (data.fitnessGoals?.length) {
                results.fitnessGoals = await Promise.all(data.fitnessGoals.map(goal => tx.fitnessGoal.create({ data: { clientId, ...goal } })));
            }
            if (data.dietaryRestrictions?.length) {
                results.dietaryRestrictions = await Promise.all(data.dietaryRestrictions.map(restriction => tx.dietaryRestriction.create({ data: { clientId, ...restriction } })));
            }
            return results;
        });
    }
}
exports.MedicalService = MedicalService;
//# sourceMappingURL=medical-services.js.map