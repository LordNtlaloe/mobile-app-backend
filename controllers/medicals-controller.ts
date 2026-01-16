// controllers/medical-controller.ts
import { Request, Response } from "express";
import { MedicalService } from "../services/medical-services";

const medicalService = new MedicalService();

// Medical Conditions
export const addMedicalCondition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.condition) {
            res.status(400).json({ error: "Condition is required" });
            return;
        }

        const condition = await medicalService.addMedicalCondition(clientId as string, data);
        res.status(201).json(condition);
    } catch (error) {
        console.error("Add medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedicalConditions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const conditions = await medicalService.getMedicalConditions(clientId as string);
        res.json(conditions);
    } catch (error) {
        console.error("Get medical conditions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateMedicalCondition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.condition) {
            res.status(400).json({ error: "Condition is required" });
            return;
        }

        const condition = await medicalService.updateMedicalCondition(id as string, clientId as string, data);
        res.json({
            message: "Medical condition updated successfully",
            data: condition
        });
    } catch (error: any) {
        console.error("Update medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMedicalCondition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteMedicalCondition(id as string, clientId as string);
        res.json({ message: "Medical condition deleted successfully" });
    } catch (error: any) {
        console.error("Delete medical condition error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Allergies
export const addAllergy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.allergen) {
            res.status(400).json({ error: "Allergen is required" });
            return;
        }

        const allergy = await medicalService.addAllergy(clientId as string, data);
        res.status(201).json(allergy);
    } catch (error) {
        console.error("Add allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllergies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const allergies = await medicalService.getAllergies(clientId as string);
        res.json(allergies);
    } catch (error) {
        console.error("Get allergies error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateAllergy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.allergen) {
            res.status(400).json({ error: "Allergen is required" });
            return;
        }

        const allergy = await medicalService.updateAllergy(id as string, clientId as string, data);
        res.json({
            message: "Allergy updated successfully",
            data: allergy
        });
    } catch (error: any) {
        console.error("Update allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteAllergy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteAllergy(id as string, clientId as string);
        res.json({ message: "Allergy deleted successfully" });
    } catch (error: any) {
        console.error("Delete allergy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Medications
export const addMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.name) {
            res.status(400).json({ error: "Medication name is required" });
            return;
        }

        const medication = await medicalService.addMedication(clientId as string, data);
        res.status(201).json(medication);
    } catch (error) {
        console.error("Add medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const medications = await medicalService.getMedications(clientId as string);
        res.json(medications);
    } catch (error) {
        console.error("Get medications error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.name) {
            res.status(400).json({ error: "Medication name is required" });
            return;
        }

        const medication = await medicalService.updateMedication(id as string, clientId as string, data);
        res.json({
            message: "Medication updated successfully",
            data: medication
        });
    } catch (error: any) {
        console.error("Update medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteMedication(id as string, clientId as string);
        res.json({ message: "Medication deleted successfully" });
    } catch (error: any) {
        console.error("Delete medication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Injuries
export const addInjury = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.description) {
            res.status(400).json({ error: "Injury description is required" });
            return;
        }

        const injury = await medicalService.addInjury(clientId as string, data);
        res.status(201).json(injury);
    } catch (error) {
        console.error("Add injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getInjuries = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const injuries = await medicalService.getInjuries(clientId as string);
        res.json(injuries);
    } catch (error) {
        console.error("Get injuries error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateInjury = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.description) {
            res.status(400).json({ error: "Injury description is required" });
            return;
        }

        const injury = await medicalService.updateInjury(id as string, clientId as string, data);
        res.json({
            message: "Injury updated successfully",
            data: injury
        });
    } catch (error: any) {
        console.error("Update injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteInjury = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteInjury(id as string, clientId as string);
        res.json({ message: "Injury deleted successfully" });
    } catch (error: any) {
        console.error("Delete injury error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fitness Goals
export const addFitnessGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.goal) {
            res.status(400).json({ error: "Goal is required" });
            return;
        }

        const goal = await medicalService.addFitnessGoal(clientId as string, data);
        res.status(201).json(goal);
    } catch (error) {
        console.error("Add fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getFitnessGoals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const goals = await medicalService.getFitnessGoals(clientId as string);
        res.json(goals);
    } catch (error) {
        console.error("Get fitness goals error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateFitnessGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.goal) {
            res.status(400).json({ error: "Goal is required" });
            return;
        }

        const goal = await medicalService.updateFitnessGoal(id as string, clientId as string, data);
        res.json({
            message: "Fitness goal updated successfully",
            data: goal
        });
    } catch (error: any) {
        console.error("Update fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markGoalAsAchieved = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, clientId } = req.params;
        const goal = await medicalService.markGoalAsAchieved(id as string, clientId as string);
        res.json({
            message: "Goal marked as achieved",
            data: goal
        });
    } catch (error) {
        console.error("Mark goal as achieved error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteFitnessGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteFitnessGoal(id as string, clientId as string);
        res.json({ message: "Fitness goal deleted successfully" });
    } catch (error: any) {
        console.error("Delete fitness goal error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Dietary Restrictions
export const addDietaryRestriction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        if (!data.restriction) {
            res.status(400).json({ error: "Dietary restriction is required" });
            return;
        }

        const restriction = await medicalService.addDietaryRestriction(clientId as string, data);
        res.status(201).json(restriction);
    } catch (error) {
        console.error("Add dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getDietaryRestrictions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const restrictions = await medicalService.getDietaryRestrictions(clientId as string);
        res.json(restrictions);
    } catch (error) {
        console.error("Get dietary restrictions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateDietaryRestriction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        const data = req.body;

        if (!data.restriction) {
            res.status(400).json({ error: "Dietary restriction is required" });
            return;
        }

        const restriction = await medicalService.updateDietaryRestriction(id as string, clientId as string, data);
        res.json({
            message: "Dietary restriction updated successfully",
            data: restriction
        });
    } catch (error: any) {
        console.error("Update dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteDietaryRestriction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId, id } = req.params;
        await medicalService.deleteDietaryRestriction(id as string, clientId as string);
        res.json({ message: "Dietary restriction deleted successfully" });
    } catch (error: any) {
        console.error("Delete dietary restriction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Bulk Health Info
export const addClientHealthInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clientId } = req.params;
        const data = req.body;

        const result = await medicalService.addClientHealthInfo(clientId as string, data);
        res.status(201).json({
            message: "Health information added successfully",
            data: result
        });
    } catch (error) {
        console.error("Add client health info error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};