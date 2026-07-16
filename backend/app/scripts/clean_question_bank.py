import json
import argparse
from pathlib import Path


def normalize(text: str) -> str:
    return (
        text.lower()
        .strip()
        .replace("?", "")
        .replace(".", "")
        .replace(",", "")
        .replace("  ", " ")
    )


def make_key(item):
    question = normalize(item.get("question", ""))

    skill = item.get("skill", "").strip().lower()

    category = item.get("category", "").strip().lower()

    return (
        question,
        skill,
        category,
    )


def clean_json(path: Path):

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    seen = set()

    cleaned = []

    duplicates = []

    for item in data:

        key = make_key(item)

        if key in seen:
            duplicates.append(item)
            continue

        seen.add(key)
        cleaned.append(item)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            cleaned,
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"Original   : {len(data)}")
    print(f"Remaining  : {len(cleaned)}")
    print(f"Duplicates : {len(duplicates)}")


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "json_file",
        help="Question bank json file",
    )

    args = parser.parse_args()

    clean_json(Path(args.json_file))
