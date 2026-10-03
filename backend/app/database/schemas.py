from xmlrpc.client import boolean
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator
from datetime import datetime
from .models import ExperimentType, TrainingEnvironment, MetricSplit
from . import models


class ExperimentCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None
    project_url: HttpUrl | None = None
    dataset_name: str = Field(min_length=1)
    dataset_public_url: HttpUrl | None = None
    experiment_type: ExperimentType


class ExperimentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = None
    project_url: HttpUrl | None = None
    dataset_name: str | None = Field(default=None, min_length=1)
    dataset_public_url: HttpUrl | None = None
    experiment_type: ExperimentType | None = None


class ExperimentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    project_url: HttpUrl | None = None
    dataset_name: str
    dataset_public_url: HttpUrl | None
    experiment_type: ExperimentType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class PreprocessingStepCreate(BaseModel):
    name: str = Field(min_length=1)
    type: str = Field(min_length=1)
    configuration: dict | None = None
    step_order: int = Field(ge=1)


class PreprocessingStepResponse(BaseModel):
    id: int
    name: str
    type: str
    configuration: dict | None
    step_order: int

    model_config = ConfigDict(from_attributes=True)



class DataConfigurationCreate(BaseModel):
    name: str = Field(min_length=1)
    dataset_version: str | None = None
    description: str | None = None

    train_ratio: float = Field(ge=0, le=1)
    validation_ratio: float = Field(ge=0, le=1)
    test_ratio: float = Field(ge=0, le=1)

    shuffle: bool = True
    random_seed: int | None = None
    stratified: bool = False

    preprocessing_steps: list[PreprocessingStepCreate] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_ratios(self):
        if abs(
            self.train_ratio
            + self.validation_ratio
            + self.test_ratio
            - 1.0
        ) >= 1e-6:
            raise ValueError(
                "train_ratio + validation_ratio + test_ratio must equal 1.0"
            )

        return self


class DataConfigurationResponse(BaseModel):
    id: int
    name: str
    dataset_version: str | None
    description: str | None

    train_ratio: float
    validation_ratio: float
    test_ratio: float

    shuffle: bool
    random_seed: int | None
    stratified: bool

    created_at: datetime
    preprocessing_steps: list[PreprocessingStepResponse] = Field(
    default_factory=list
)

    model_config = ConfigDict(from_attributes=True)






class ParameterCreate(BaseModel):
    name: str = Field(min_length=1)
    value: str
    type: Literal["integer", "float", "string", "boolean"]


class ParameterResponse(BaseModel):
    id: int
    name: str
    value: str
    type: Literal["integer", "float", "string", "boolean"]

    model_config = ConfigDict(from_attributes=True)





class MetricCreate(BaseModel):
    name: str = Field(min_length=1)
    value: float
    split: MetricSplit


class MetricResponse(BaseModel):
    id: int
    name: str
    value: float
    split: MetricSplit

    model_config = ConfigDict(from_attributes=True)




class RunCreate(BaseModel):
    data_config_id: int
    model_name: str = Field(min_length=1)
    training_duration: float = Field(ge=0)
    environment_type: TrainingEnvironment
    environment_specs: str | None = None

    parameters: list[ParameterCreate] = Field(default_factory=list)
    metrics: list[MetricCreate] = Field(default_factory=list)


class RunResponse(BaseModel):
    id: int
    data_config_id: int
    model_name: str
    training_duration: float
    environment_type: TrainingEnvironment
    environment_specs: str | None
    created_at: datetime

    parameters: list[ParameterResponse]
    metrics: list[MetricResponse]

    model_config = ConfigDict(from_attributes=True)


class RunUpdate(BaseModel):
    model_name: str | None = Field(default=None, min_length=1)
    training_duration: float | None = Field(default=None, ge=0)
    environment_type: TrainingEnvironment | None = None
    environment_specs: str | None = None



class ArtifactCreate(BaseModel):
    note: str | None = None


class ArtifactResponse(BaseModel):
    id: int
    image_data: str | None
    image_filename: str | None
    image_type: str | None
    note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)




class AdminOverviewResponse(BaseModel):
    total_users: int
    total_experiments: int
    total_data_configurations: int
    total_runs: int
    total_artifacts: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: models.UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)