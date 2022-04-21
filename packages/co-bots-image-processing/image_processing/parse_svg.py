import json
import shutil
from string import Template
from xml.dom.minidom import parse

import numpy as np
import pandas as pd
from image_processing.constants import (
    CHARACTERISTICS_ORDERED,
    PALETTES_FILE,
    TRAITS_COMPUTED_DIR,
    TRAITS_DIR,
    TRAITS_ORDERED,
)
from image_processing.svg_to_path_ordered import dom2dict

#%% Define constants
RECT = Template("<rect x='$x' y='$y' width='$width' height='$height' fill='#$fill' />")


#%% Define functions
def parse_rect(rect):
    corner = np.array([rect.get("x", 0), rect.get("y", 0)])
    if "transform" in rect:
        matrix = (
            np.array(
                rect["transform"].replace("matrix(", "").replace(")", "").split(" ")
            )
            .reshape(3, 2)
            .T.astype(int)
        )
        corner = matrix[:, 2] + np.matmul(
            (matrix[:, :2] - np.identity(2)) / 2,
            np.array([rect.get("width", 0), rect.get("height", 0)]).astype(int),
        )
    return {
        "x": corner[0],
        "y": corner[1],
        "width": rect["width"],
        "height": rect["height"],
        "fill": rect["fill"],
    }


def generate_svg(_rects, _palette):
    return (
        """<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\" width=\"450px\" height=\"450px\">"""
        + (
            "".join(
                [
                    RECT.substitute(**{**rect, "fill": _palette[rect["fillIndex"]]})
                    for rect in _rects
                ]
            )
        )
        + "</svg>"
    )


#%% Parse files
rects_list = []
for file in TRAITS_DIR.glob("**/*.svg"):
    doc = parse(str(file))
    rects_list += [
        {**parse_rect(dom2dict(node)), "file": str(file)}
        for node in doc.documentElement.childNodes
        if node.localName == "rect"
    ]

#%% Build collection
rects_df = (
    pd.DataFrame(rects_list)
    .replace({"fill": {"black": "#000000", "white": "#FFFFFF"}})
    .astype({"x": int, "y": int, "width": int, "height": int})
    .assign(fill=lambda df: df["fill"].str.replace("#", ""))
    .astype({"fill": "category"})
    .assign(
        fill_code=lambda df: df.fill.cat.codes,
        rect=lambda df: df[["x", "y", "width", "height", "fill_code"]]
        .rename(columns={"fill_code": "fillIndex"})
        .astype(int)
        .to_dict("records"),
    )
)
palette = rects_df.fill.cat.categories.tolist()
characteristics = (
    rects_df.groupby("file")
    .agg({"rect": list})
    .reset_index()
    .rename(columns={"rect": "rects"})
    .assign(
        characteristic=lambda df: pd.Categorical(
            df.file.str.split("/", expand=True)[2], categories=CHARACTERISTICS_ORDERED
        ),
        name=lambda df: df.file.str.split("/", expand=True)[3].str.replace(
            ".svg", "", regex=False
        ),
    )
    .sort_values(["characteristic"])
    .groupby("characteristic")
    .apply(
        lambda group: group.assign(
            name_cat=lambda df: pd.Categorical(
                df.name,
                categories=TRAITS_ORDERED[group.name],
            ),
            name=lambda df: df.name_cat.astype("string").fillna(df.name),
        )
        .sort_values("name_cat")
        .drop("name_cat", axis=1)
    )
    .reset_index(drop=True)
    .assign(trait=lambda df: df[["name", "rects"]].to_dict("records"))
    .groupby("characteristic")
    .agg({"trait": list})
    .reset_index()
    .rename(columns={"trait": "traits", "characteristic": "name"})
    .to_dict("records")
)
collection = {
    "description": "Co-Bots are cooperation robots | CC0 & 100% On-Chain | co-bots.com.",
    "characteristics": characteristics,
}


#%% Dump reconstructed SVG files for visual check
shutil.rmtree(TRAITS_COMPUTED_DIR, ignore_errors=True)
for characteristic in collection["characteristics"]:
    characteristic_dir = TRAITS_COMPUTED_DIR / characteristic["name"]
    characteristic_dir.mkdir(exist_ok=True, parents=True)
    for trait in characteristic["traits"]:
        trait_file = characteristic_dir / (trait["name"] + ".svg")
        trait_file.write_text(generate_svg(trait["rects"], palette))

#%% Dump palettes and traits
with open(PALETTES_FILE, "w") as f:
    json.dump(
        {"collection": collection, "palette": palette},
        f,
        indent=2,
    )
