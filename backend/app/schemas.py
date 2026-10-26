"""Contratos públicos validados antes de qualquer acesso a disco ou processamento."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from shapely.geometry import Polygon


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class Credentials(StrictModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class Verification(StrictModel):
    token: str = Field(min_length=16, max_length=200)


class Area(StrictModel):
    name: str = Field(min_length=1, max_length=100)
    coordinates: list[tuple[float, float]] = Field(min_length=3, max_length=100)
    notes: str = Field(default="", max_length=2000)
    status: Literal["planejada", "em_andamento", "concluida"] = "planejada"
    visit_date: date | None = None

    @model_validator(mode="after")
    def valid_polygon(self):
        if any(
            not (-47.2 <= x <= -45.8 and -24.2 <= y <= -23) for x, y in self.coordinates
        ):
            raise ValueError("Coordenadas fora da região de São Paulo")
        polygon = Polygon(self.coordinates)
        if not polygon.is_valid or polygon.area <= 0:
            raise ValueError("Polígono inválido, cruzado ou sem área")
        return self


class PixelDownload(StrictModel):
    scene_id: str = Field(pattern=r"^LC0[89]_L2SP_[A-Za-z0-9_]{10,100}$")
    bbox: tuple[float, float, float, float]

    @model_validator(mode="after")
    def valid_bbox(self):
        west, south, east, north = self.bbox
        if not (-46.85 <= west < east <= -46.3 and -24.05 <= south < north <= -23.3):
            raise ValueError("BBox fora da região suportada")
        return self


class TrainRequest(StrictModel):
    dataset_ids: list[str] = Field(min_length=1, max_length=30)
    feature_set: Literal["spectral", "urban"] = "spectral"
    strategy: Literal["temporal", "spatial"] = "temporal"


class PredictRequest(StrictModel):
    rows: list[dict[str, float]] = Field(min_length=1, max_length=2000)
    model_id: str | None = Field(default=None, pattern=r"^[a-f0-9]{24}$")


class DemoRequest(StrictModel):
    confirm_synthetic: Literal[True]
