import docx

from docx.table import Table
from docx.text.paragraph import Paragraph


def iter_block_items(document):
    """
    Yield DOCX paragraphs and tables in their original document order.
    """

    for child in document.element.body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(
                child,
                document,
            )

        elif child.tag.endswith("}tbl"):
            yield Table(
                child,
                document,
            )


def extract_table_rows(table: Table) -> list[str]:
    """
    Extract non-empty table cells while preserving row order.

    Duplicate cell text inside the same row is removed because merged
    DOCX cells can sometimes expose the same content more than once.
    """

    output = []

    for row in table.rows:
        row_values = []
        seen = set()

        for cell in row.cells:
            cell_text = " ".join(cell.text.split())

            if not cell_text:
                continue

            normalized = cell_text.casefold()

            if normalized in seen:
                continue

            seen.add(normalized)
            row_values.append(cell_text)

        if row_values:
            output.append(" | ".join(row_values))

    return output


def extract_text_from_docx(
    file_path: str,
) -> str:
    """
    Extract paragraphs and tables in their original DOCX order.

    Preserving order is required for section-based resume parsing.
    For example, a skills table between the Skills and Experience
    headings must remain inside the Skills section.
    """

    document = docx.Document(file_path)

    full_text = []

    for block in iter_block_items(document):
        if isinstance(
            block,
            Paragraph,
        ):
            paragraph_text = block.text.strip()

            if paragraph_text:
                full_text.append(paragraph_text)

        elif isinstance(
            block,
            Table,
        ):
            full_text.extend(extract_table_rows(block))

    return "\n".join(full_text)
