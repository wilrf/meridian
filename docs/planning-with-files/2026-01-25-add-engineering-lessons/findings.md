# Findings

## Structural Changes
We are modifying `03_external_world` to include engineering topics.

**New Sequence:**
1.  `3.1_modules_and_imports.md` (New)
2.  `3.2_virtual_environments.md` (New)
3.  `3.3_files.md` (Was 3.1)
4.  `3.4_apis.md` (Was 3.2)
5.  `3.5_debugging.md` (New)
6.  `3.6_testing.md` (New)
7.  `3.7_project_stock_fetcher` (Was 3.3)

## Lesson Content Sketches

### 3.1 Modules & Imports
- **Problem**: Code is too long for one file.
- **Metaphor**: Organizing a book into chapters.
- **Tech**: `import`, `from ... import`, `sys.path`.

### 3.2 Virtual Environments
- **Problem**: Different projects need different library versions.
- **Metaphor**: Separate kitchens for separate restaurants (so ingredients don't mix).
- **Tech**: `venv`, `pip install`, `requirements.txt`.

### 3.5 Debugging
- **Problem**: Code doesn't work.
- **Metaphor**: Detective work.
- **Tech**: Tracebacks (reading bottom-up), `print()`, `pdb`.

### 3.6 Testing
- **Problem**: How do you know it works? How do you know you didn't break it?
- **Metaphor**: Safety inspections / Double-entry bookkeeping.
- **Tech**: `pytest`, `assert`.
