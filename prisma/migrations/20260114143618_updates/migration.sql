/*
  Warnings:

  - Added the required column `updatedAt` to the `Allergy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DietaryRestriction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FitnessGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Injury` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MedicalCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NutritionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Allergy" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DietaryRestriction" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "FitnessGoal" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Injury" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MedicalCondition" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NutritionLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
