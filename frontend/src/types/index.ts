export type UserRole = "user" | "admin"

export interface User {
  Username: string
  Role: UserRole
}

export interface AdminUser {
  id: number
  email: string
  role: UserRole
  created_at: string
}

export type ExperimentType =
  | "classification"
  | "regression"
  | "clustering"
  | "dimensionality_reduction"
  | "anomaly_detection"
  | "generation"
  | "other"

export interface Experiment {
  id: number
  name: string
  description: string | null
  project_url: string | null
  dataset_name: string
  dataset_public_url: string | null
  experiment_type: ExperimentType
  created_at: string
  updated_at: string
}

export interface ExperimentCreate {
  name: string
  description?: string | null
  project_url?: string | null
  dataset_name: string
  dataset_public_url?: string | null
  experiment_type: ExperimentType
}

export interface ExperimentUpdate {
  name?: string
  description?: string | null
  project_url?: string | null
  dataset_name?: string
  dataset_public_url?: string | null
  experiment_type?: ExperimentType
}

export interface PreprocessingStep {
  id?: number
  name: string
  type: string
  configuration?: Record<string, any> | null
  step_order: number
}

export interface DataConfiguration {
  id: number
  name: string
  dataset_version: string | null
  description: string | null
  train_ratio: number
  validation_ratio: number
  test_ratio: number
  shuffle: boolean
  random_seed: number | null
  stratified: boolean
  created_at: string
  preprocessing_steps: PreprocessingStep[]
}

export interface DataConfigurationCreate {
  name: string
  dataset_version?: string | null
  description?: string | null
  train_ratio: number
  validation_ratio: number
  test_ratio: number
  shuffle?: boolean
  random_seed?: number | null
  stratified?: boolean
  preprocessing_steps?: PreprocessingStep[]
}

export type TrainingEnvironment = "local" | "cloud"

export type ParameterType = "integer" | "float" | "string" | "boolean"

export interface Parameter {
  id?: number
  name: string
  value: string
  type: ParameterType
}

export type MetricSplit = "train" | "test" | "validation"

export interface Metric {
  id?: number
  name: string
  value: number
  split: MetricSplit
}

export interface Run {
  id: number
  data_config_id: number
  model_name: string
  training_duration: number
  environment_type: TrainingEnvironment
  environment_specs: string | null
  created_at: string
  parameters: Parameter[]
  metrics: Metric[]
}

export interface RunCreate {
  data_config_id: number
  model_name: string
  training_duration: number
  environment_type: TrainingEnvironment
  environment_specs?: string | null
  parameters?: Parameter[]
  metrics?: Metric[]
}

export interface RunUpdate {
  model_name?: string
  training_duration?: number
  environment_type?: TrainingEnvironment
  environment_specs?: string | null
}

export interface Artifact {
  id: number
  image_data: string | null
  image_filename: string | null
  image_type: string | null
  note: string | null
  created_at: string
}

export interface AdminOverview {
  total_users: number
  total_experiments: number
  total_data_configurations: number
  total_runs: number
  total_artifacts: number
}
