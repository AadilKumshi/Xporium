import enum

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


def _enum_values(enum_cls):
    return [member.value for member in enum_cls]


class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"


class TrainingEnvironment(enum.Enum):
    LOCAL = "local"
    CLOUD = "cloud"


class ExperimentType(enum.Enum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    DIMENSIONALITY_REDUCTION = "dimensionality_reduction"
    ANOMALY_DETECTION = "anomaly_detection"
    GENERATION = "generation"
    OTHER = "other"


class MetricSplit(enum.Enum):
    TRAIN = "train"
    TEST = "test"
    VALIDATION = "validation"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(UserRole, values_callable=_enum_values),
        default=UserRole.USER,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    experiments = relationship(
        "Experiment",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_url = Column(String, nullable=True)

    dataset_name = Column(String, nullable=False, index=True)
    dataset_public_url = Column(String, nullable=True)

    experiment_type = Column(
        Enum(ExperimentType, values_callable=_enum_values),
        nullable=False,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="experiments")

    data_configurations = relationship(
        "DataConfiguration",
        back_populates="experiment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    runs = relationship(
        "Run",
        secondary="data_configurations",
        primaryjoin="Experiment.id == DataConfiguration.experiment_id",
        secondaryjoin="Run.data_config_id == DataConfiguration.id",
        viewonly=True,
    )


class DataConfiguration(Base):
    __tablename__ = "data_configurations"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(
        Integer,
        ForeignKey("experiments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=False)
    dataset_version = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    train_ratio = Column(Float, nullable=False)
    validation_ratio = Column(Float, nullable=False)
    test_ratio = Column(Float, nullable=False)

    shuffle = Column(Boolean, nullable=False, default=True)
    random_seed = Column(Integer, nullable=True)
    stratified = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "train_ratio >= 0 AND validation_ratio >= 0 AND test_ratio >= 0",
            name="ck_data_config_ratios_non_negative",
        ),
        CheckConstraint(
            "abs(train_ratio + validation_ratio + test_ratio - 1.0) < 1e-6",
            name="ck_data_config_ratios_sum_to_one",
        ),
    )

    experiment = relationship("Experiment", back_populates="data_configurations")

    preprocessing_steps = relationship(
        "PreprocessingStep",
        back_populates="data_config",
        cascade="all, delete-orphan",
        order_by="PreprocessingStep.step_order",
        passive_deletes=True,
    )

    # No delete-orphan: deleting a Run must not delete this configuration.
    # passive_deletes lets ON DELETE CASCADE remove child Runs when this
    # configuration is deleted (e.g. via Experiment deletion).
    runs = relationship(
        "Run",
        back_populates="data_config",
        passive_deletes=True,
    )


class PreprocessingStep(Base):
    __tablename__ = "preprocessing_steps"

    id = Column(Integer, primary_key=True, index=True)
    data_config_id = Column(
        Integer,
        ForeignKey("data_configurations.id", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    configuration = Column(JSON, nullable=True)
    step_order = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("data_config_id", "step_order", name="uq_preprocessing_step_order"),
    )

    data_config = relationship("DataConfiguration", back_populates="preprocessing_steps")


class Run(Base):
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True, index=True)
    data_config_id = Column(
        Integer,
        ForeignKey("data_configurations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    model_name = Column(String, nullable=False)
    training_duration = Column(Float, nullable=False)
    environment_type = Column(
        Enum(TrainingEnvironment, values_callable=_enum_values),
        nullable=False,
    )
    environment_specs = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    data_config = relationship("DataConfiguration", back_populates="runs")

    # Derived through data_config; read-only. No experiment_id column.
    experiment = relationship(
        "Experiment",
        secondary="data_configurations",
        primaryjoin="Run.data_config_id == DataConfiguration.id",
        secondaryjoin="Experiment.id == DataConfiguration.experiment_id",
        viewonly=True,
        uselist=False,
    )

    parameters = relationship(
        "Parameter",
        back_populates="run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    metrics = relationship(
        "Metric",
        back_populates="run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    artifact = relationship(
        "Artifact",
        back_populates="run",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Parameter(Base):
    __tablename__ = "parameters"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(
        Integer,
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    type = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "run_id",
            "name",
            name="uq_parameter_run_name",
        ),
    )

    run = relationship("Run", back_populates="parameters")


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(
        Integer,
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    split = Column(
        Enum(MetricSplit, values_callable=_enum_values),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("run_id", "name", "split", name="uq_metric_run_name_split"),
    )

    run = relationship("Run", back_populates="metrics")


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(
        Integer,
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    image_data = Column(LargeBinary, nullable=True)
    image_filename = Column(String, nullable=True)
    image_type = Column(String, nullable=True)
    note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    run = relationship("Run", back_populates="artifact")
