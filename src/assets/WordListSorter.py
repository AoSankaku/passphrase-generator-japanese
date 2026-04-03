import csv
import sys
from pathlib import Path


def normalize(row: list[str]) -> tuple[str, str]:
    if len(row) != 2:
        raise ValueError(f"Expected 2 columns, got {len(row)}: {row}")
    return row[0].strip(), row[1].strip()


def word_list_sorter(csv_path: Path) -> None:
    seen_rows: set[tuple[str, str]] = set()
    seen_readings: set[str] = set()
    deduped_rows: list[tuple[str, str]] = []

    with csv_path.open("r", encoding="utf-8", newline="") as csv_file:
        reader = csv.reader(csv_file)
        for line_no, raw_row in enumerate(reader, start=1):
            if not raw_row:
                continue

            row = normalize(raw_row)
            if not all(row):
                raise ValueError(f"Blank value at line {line_no}: {raw_row}")

            if row in seen_rows:
                continue
            seen_rows.add(row)

            if row[1] in seen_readings:
                continue
            seen_readings.add(row[1])

            deduped_rows.append(row)

    with csv_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(deduped_rows)


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("./wordlist.csv")
    word_list_sorter(target)
