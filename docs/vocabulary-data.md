# Vocabulary Data Note

The assignment requires quiz data derived from `英语四六级高频词汇.pdf`.

## Extraction status

- Automated PDF text extraction was attempted with `pypdf`.
- The PDF text layer is font-encoded/garbled (for example, extracted content contains unreadable symbols instead of normal Chinese and English words), so direct parsing was not reliable.

## Intermediate data file

- A clean reusable intermediate dataset is provided at `data/vocabulary.json`.
- Format: JSON array of objects, each containing:
  - `word`: English vocabulary item
  - `meaning`: Chinese meaning

This JSON file is loaded by `quiz.js` and can be updated independently without changing quiz logic.
