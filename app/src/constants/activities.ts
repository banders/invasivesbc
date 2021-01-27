import { SvgIconComponent, Assignment, Build, Visibility } from '@material-ui/icons';

export enum ActivityType {
  Observation = 'Observation',
  Treatment = 'Treatment',
  Treatment_BulkEdit = 'Treatment_BulkEdit',
  Monitoring = 'Monitoring'
}

export enum ActivitySubtype {
  Observation_PlantTerrestrial = 'Activity_Observation_PlantTerrestrial',
  Observation_PlantTerrestrial_BulkEdit = 'Activity_Observation_PlantTerrestrial_BulkEdit',
  Observation_PlantAquatic = 'Activity_Observation_PlantAquatic',
  Observation_AnimalTerrestrial = 'Activity_Observation_AnimalTerrestrial',
  Observation_AnimalAquatic = 'Activity_Observation_AnimalAquatic',

  Treatment_ChemicalPlant = 'Activity_Treatment_ChemicalPlant',
  Treatment_ChemicalPlant_BulkEdit = 'Activity_Treatment_ChemicalPlant_BulkEdit',
  Treatment_MechanicalPlant = 'Activity_Treatment_MechanicalPlant',
  Treatment_MechanicalPlant_BulkEdit = 'Activity_Treatment_MechanicalPlant_BulkEdit',
  Treatment_BiologicalPlant = 'Activity_Treatment_BiologicalPlant',
  Treatment_BiologicalPlant_BulkEdit = 'Activity_Treatment_BiologicalPlant_BulkEdit',
  Treatment_MechanicalTerrestrialAnimal = 'Activity_Treatment_MechanicalTerrestrialAnimal',
  Treatment_ChemicalTerrestrialAnimal = 'Activity_Treatment_ChemicalTerrestrialAnimal',
  Treatment_BiologicalTerrestrialAnimal = 'Activity_Treatment_BiologicalTerrestrialAnimal',

  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiologicalTerrestrialPlant',
  Monitoring_MechanicalTerrestrialAnimal = 'Activity_Monitoring_MechanicalTerrestrialAnimal',
  Monitoring_ChemicalTerrestrialAnimal = 'Activity_Monitoring_ChemicalTerrestrialAnimal',
  Monitoring_BiologicalTerrestrialAnimal = 'Activity_Monitoring_BiologicalTerrestrialAnimal'
}

export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
  [ActivityType.Observation]: Assignment,
  [ActivityType.Treatment]: Build,
  [ActivityType.Monitoring]: Visibility
};

export enum ActivityStatus {
  NEW = 'New',
  EDITED = 'Edited'
}

export enum ActivitySyncStatus {
  NOT_SYNCED = 'Not Synced',
  SYNC_SUCCESSFUL = 'Sync Successful',
  SYNC_FAILED = 'Sync Failed'
}

export enum FormValidationStatus {
  NOT_VALIDATED = 'Not Validated',
  INVALID = 'Invalid',
  VALID = 'Valid'
}
