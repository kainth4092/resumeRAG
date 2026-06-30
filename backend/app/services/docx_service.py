import docx


def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    full_text = []

    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text)

    for table in doc.tables:
        for row in table.rows:
            row_text = []
            for cell in row.cells:
                cell_text = cell.text.strip()
                if cell_text and cell_text not in row_text:
                    row_text.append(cell_text)
            if row_text:
                full_text.append(" | ".join(row_text))

    return "\n".join(full_text)
