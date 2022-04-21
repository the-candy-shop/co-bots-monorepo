from pathlib import Path
from string import digits

DATA_DIR = Path("data")
TRAITS_DIR = DATA_DIR / "traits"
TRAITS_COMPUTED_DIR = DATA_DIR / "traits_computed"
PALETTES_FILE = DATA_DIR / "palettes.json"

CHARACTERISTICS_ORDERED = [
    "Colour",
    "Digit 1",
    "Digit 2",
    "Digit 3",
    "Digit 4",
    "Eyes",
    "Mouth",
    "Antenna",
    "Feet",
    "Metta",
]

TRAITS_ORDERED = {
    "Colour": [
        "Black",
        "Blue",
        "Red",
    ],
    "Digit 1": list(digits),
    "Digit 2": list(digits),
    "Digit 3": list(digits),
    "Digit 4": list(digits),
    "Eyes": [
        "Classic",
        "Cyclops",
        "Awoken",
        "Flirty",
        "Zen",
        "Sadhappy",
        "Unaligned",
        "Smitten",
        "Optimistic",
        "Hacky",
        "Super",
        "Nounish",
    ],
    "Mouth": [
        "Classic",
        "Worried",
        "Knightly",
        "Shy",
        "Happy",
        "Bigsad",
        "Smug",
        "Wowed",
        "Thirsty",
        "Villainous",
        "Shady",
    ],
    "Antenna": [
        "Classic",
        "Serious",
        "Jumpy",
        "Buzzed",
        "Buggy",
        "Punk",
        "Angelic",
        "Impish",
        "Humbled",
        "Western",
        "Royal",
        "Hacky",
        "!croak",
        "⌐◨-◨",
        "Wizard",
    ],
    "Metta": ["Off", "On", "Offline"],
    "Feet": [
        "Classic",
        "Heavy Duty",
        "Firey",
        "Little Firey",
        "Roller",
        "Little Roller",
        "Energetic",
        "Little Energetic",
        "Hobbled",
        "Ghostly",
        "Pushy",
    ],
}
