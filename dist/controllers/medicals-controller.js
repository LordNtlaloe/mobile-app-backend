"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClientHealthInfo = exports.deleteDietaryRestriction = exports.updateDietaryRestriction = exports.getDietaryRestrictions = exports.addDietaryRestriction = exports.deleteFitnessGoal = exports.markGoalAsAchieved = exports.updateFitnessGoal = exports.getFitnessGoals = exports.addFitnessGoal = exports.deleteInjury = exports.updateInjury = exports.getInjuries = exports.addInjury = exports.deleteMedication = exports.updateMedication = exports.getMedications = exports.addMedication = exports.deleteAllergy = exports.updateAllergy = exports.getAllergies = exports.addAllergy = exports.deleteMedicalCondition = exports.updateMedicalCondition = exports.getMedicalConditions = exports.addMedicalCondition = void 0;
const medical_services_1 = require("../services/medical-services");
const medicalService = new medical_services_1.MedicalService();
const addMedicalCondition = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.condition) {
            res.status(400).json({ error: "Condition is required" });
            return;
        }
        const condition = await medicalService.addMedicalCondition(clientId, data);
        res.status(201).json(condition);
    }
    catch (error) {
        console.error("Add medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addMedicalCondition = addMedicalCondition;
const getMedicalConditions = async (req, res) => {
    try {
        const { clientId } = req.params;
        const conditions = await medicalService.getMedicalConditions(clientId);
        res.json(conditions);
    }
    catch (error) {
        console.error("Get medical conditions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMedicalConditions = getMedicalConditions;
const updateMedicalCondition = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.condition) {
            res.status(400).json({ error: "Condition is required" });
            return;
        }
        const condition = await medicalService.updateMedicalCondition(id, clientId, data);
        res.json({
            message: "Medical condition updated successfully",
            data: condition
        });
    }
    catch (error) {
        console.error("Update medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateMedicalCondition = updateMedicalCondition;
const deleteMedicalCondition = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteMedicalCondition(id, clientId);
        res.json({ message: "Medical condition deleted successfully" });
    }
    catch (error) {
        console.error("Delete medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteMedicalCondition = deleteMedicalCondition;
const addAllergy = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.allergen) {
            res.status(400).json({ error: "Allergen is required" });
            return;
        }
        const allergy = await medicalService.addAllergy(clientId, data);
        res.status(201).json(allergy);
    }
    catch (error) {
        console.error("Add allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addAllergy = addAllergy;
const getAllergies = async (req, res) => {
    try {
        const { clientId } = req.params;
        const allergies = await medicalService.getAllergies(clientId);
        res.json(allergies);
    }
    catch (error) {
        console.error("Get allergies error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllergies = getAllergies;
const updateAllergy = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.allergen) {
            res.status(400).json({ error: "Allergen is required" });
            return;
        }
        const allergy = await medicalService.updateAllergy(id, clientId, data);
        res.json({
            message: "Allergy updated successfully",
            data: allergy
        });
    }
    catch (error) {
        console.error("Update allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateAllergy = updateAllergy;
const deleteAllergy = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteAllergy(id, clientId);
        res.json({ message: "Allergy deleted successfully" });
    }
    catch (error) {
        console.error("Delete allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteAllergy = deleteAllergy;
const addMedication = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.name) {
            res.status(400).json({ error: "Medication name is required" });
            return;
        }
        const medication = await medicalService.addMedication(clientId, data);
        res.status(201).json(medication);
    }
    catch (error) {
        console.error("Add medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addMedication = addMedication;
const getMedications = async (req, res) => {
    try {
        const { clientId } = req.params;
        const medications = await medicalService.getMedications(clientId);
        res.json(medications);
    }
    catch (error) {
        console.error("Get medications error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getMedications = getMedications;
const updateMedication = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.name) {
            res.status(400).json({ error: "Medication name is required" });
            return;
        }
        const medication = await medicalService.updateMedication(id, clientId, data);
        res.json({
            message: "Medication updated successfully",
            data: medication
        });
    }
    catch (error) {
        console.error("Update medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateMedication = updateMedication;
const deleteMedication = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteMedication(id, clientId);
        res.json({ message: "Medication deleted successfully" });
    }
    catch (error) {
        console.error("Delete medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteMedication = deleteMedication;
const addInjury = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.description) {
            res.status(400).json({ error: "Injury description is required" });
            return;
        }
        const injury = await medicalService.addInjury(clientId, data);
        res.status(201).json(injury);
    }
    catch (error) {
        console.error("Add injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addInjury = addInjury;
const getInjuries = async (req, res) => {
    try {
        const { clientId } = req.params;
        const injuries = await medicalService.getInjuries(clientId);
        res.json(injuries);
    }
    catch (error) {
        console.error("Get injuries error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getInjuries = getInjuries;
const updateInjury = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.description) {
            res.status(400).json({ error: "Injury description is required" });
            return;
        }
        const injury = await medicalService.updateInjury(id, clientId, data);
        res.json({
            message: "Injury updated successfully",
            data: injury
        });
    }
    catch (error) {
        console.error("Update injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateInjury = updateInjury;
const deleteInjury = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteInjury(id, clientId);
        res.json({ message: "Injury deleted successfully" });
    }
    catch (error) {
        console.error("Delete injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteInjury = deleteInjury;
const addFitnessGoal = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.goal) {
            res.status(400).json({ error: "Goal is required" });
            return;
        }
        const goal = await medicalService.addFitnessGoal(clientId, data);
        res.status(201).json(goal);
    }
    catch (error) {
        console.error("Add fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addFitnessGoal = addFitnessGoal;
const getFitnessGoals = async (req, res) => {
    try {
        const { clientId } = req.params;
        const goals = await medicalService.getFitnessGoals(clientId);
        res.json(goals);
    }
    catch (error) {
        console.error("Get fitness goals error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getFitnessGoals = getFitnessGoals;
const updateFitnessGoal = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.goal) {
            res.status(400).json({ error: "Goal is required" });
            return;
        }
        const goal = await medicalService.updateFitnessGoal(id, clientId, data);
        res.json({
            message: "Fitness goal updated successfully",
            data: goal
        });
    }
    catch (error) {
        console.error("Update fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateFitnessGoal = updateFitnessGoal;
const markGoalAsAchieved = async (req, res) => {
    try {
        const { id, clientId } = req.params;
        const goal = await medicalService.markGoalAsAchieved(id, clientId);
        res.json({
            message: "Goal marked as achieved",
            data: goal
        });
    }
    catch (error) {
        console.error("Mark goal as achieved error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.markGoalAsAchieved = markGoalAsAchieved;
const deleteFitnessGoal = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteFitnessGoal(id, clientId);
        res.json({ message: "Fitness goal deleted successfully" });
    }
    catch (error) {
        console.error("Delete fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteFitnessGoal = deleteFitnessGoal;
const addDietaryRestriction = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        if (!data.restriction) {
            res.status(400).json({ error: "Dietary restriction is required" });
            return;
        }
        const restriction = await medicalService.addDietaryRestriction(clientId, data);
        res.status(201).json(restriction);
    }
    catch (error) {
        console.error("Add dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addDietaryRestriction = addDietaryRestriction;
const getDietaryRestrictions = async (req, res) => {
    try {
        const { clientId } = req.params;
        const restrictions = await medicalService.getDietaryRestrictions(clientId);
        res.json(restrictions);
    }
    catch (error) {
        console.error("Get dietary restrictions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getDietaryRestrictions = getDietaryRestrictions;
const updateDietaryRestriction = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;
        if (!data.restriction) {
            res.status(400).json({ error: "Dietary restriction is required" });
            return;
        }
        const restriction = await medicalService.updateDietaryRestriction(id, clientId, data);
        res.json({
            message: "Dietary restriction updated successfully",
            data: restriction
        });
    }
    catch (error) {
        console.error("Update dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateDietaryRestriction = updateDietaryRestriction;
const deleteDietaryRestriction = async (req, res) => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteDietaryRestriction(id, clientId);
        res.json({ message: "Dietary restriction deleted successfully" });
    }
    catch (error) {
        console.error("Delete dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteDietaryRestriction = deleteDietaryRestriction;
const addClientHealthInfo = async (req, res) => {
    try {
        const { clientId } = req.params;
        const data = req.body;
        const result = await medicalService.addClientHealthInfo(clientId, data);
        res.status(201).json({
            message: "Health information added successfully",
            data: result
        });
    }
    catch (error) {
        console.error("Add client health info error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.addClientHealthInfo = addClientHealthInfo;
//# sourceMappingURL=medicals-controller.js.map