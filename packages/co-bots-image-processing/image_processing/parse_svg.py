import json
import shutil
from pathlib import Path
from string import Template
from xml.dom.minidom import parse

import numpy as np
import pandas as pd
from image_processing.constants import PALETTES_FILE, TRAITS_COMPUTED_DIR, TRAITS_DIR
from image_processing.svg_to_path_ordered import dom2dict

#%% Define constants
RECT = Template("<rect x='$x' y='$y' width='$width' height='$height' fill='$fill' />")


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


def generate_svg(_codes):
    return (
        """<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\" width=\"450px\" height=\"450px\">"""
        + (
            "".join(
                [
                    RECT.substitute(**{**c, "fill": fill_palette[c["fill_code"]]})
                    for c in _codes
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

#%% Build dataframe and encode traits
traits_df = (
    pd.DataFrame(rects_list)
    .replace({"fill": {"black": "#000000", "white": "#ffffff"}})
    .astype({"x": int, "y": int, "width": int, "height": int})
    .astype({"fill": "category"})
    .assign(
        fill_code=lambda df: df.fill.cat.codes,
    )
)

fill_palette = traits_df.fill.cat.categories

# Encoding scheme
# 1. As is
#     Cost is len(traits_df) * (6 bits * 4 + 6 bits * 1) => 621 * 32 bits = 621 * 4 bytes = 2484 bytes
# 2. With a rects palette
#     Cost is len(traits_df).drop_duplicates() * 32 bits + len(traits_df) * 9 bits = 508 * 32 + 621 * 9 ~ 2730 bytes

traits_codes = (
    traits_df.filter(items=["file", "x", "y", "width", "height", "fill_code"])
    .groupby("file")
    .apply(lambda group: group.drop("file", axis=1).to_dict("records"))
)

#%% Dump reconstructed SVG files for visual check
shutil.rmtree(TRAITS_COMPUTED_DIR, ignore_errors=True)
for file_name, codes in traits_codes.items():
    file_name_computed = TRAITS_COMPUTED_DIR / Path(file_name).relative_to(TRAITS_DIR)
    file_name_computed.parent.mkdir(exist_ok=True, parents=True)

    with open(file_name_computed, "w") as f:
        f.write(generate_svg(codes))

#%% Dump palettes and traits
with open(PALETTES_FILE, "w") as f:
    json.dump(
        {
            "fill": fill_palette.tolist(),
            "trait": traits_codes.to_dict(),
        },
        f,
        indent=2,
    )
