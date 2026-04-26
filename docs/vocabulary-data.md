# Vocabulary Data Note

The quiz dataset is extracted from `英语四六级高频词汇.pdf`.

## Extraction status

- Direct text extraction (`pypdf`, `pdfminer`, `pdftotext`) produced heavy font-encoding noise.
- OCR extraction was used instead:
  - Page rendering: `pymupdf`
  - Text recognition: `rapidocr-onnxruntime`
- Parsed output was cleaned and deduplicated into `data/vocabulary.json`.

## Dataset file

- Current file: `data/vocabulary.json`
- Current size: 1683 entries
- Format:
  - `word`: English vocabulary item
  - `meaning`: Chinese meaning

`quiz.js` loads this JSON directly, so quiz capacity scales automatically with dataset size.
