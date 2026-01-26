# Task Plan: Add Engineering Reliability Lessons

## Goal
Implement missing "Engineering Reliability" lessons to bridge the gap between basic Python syntax and professional development.

## Phases

### Phase 1: Preparation & Reordering
- [ ] Create planning files.
- [ ] Backup current `03_external_world` structure (mentally or via findings).
- [ ] Rename existing `03_external_world` files to make room for new content:
    - `3.1_files.md` -> `3.3_files.md`
    - `3.2_apis.md` -> `3.4_apis.md`
    - `3.3_project...` -> `3.7_project...`

### Phase 2: Implementation (New Lessons)
- [ ] Create `3.1_modules_and_imports.md`: Organizing code, `import`, `__init__.py`.
- [ ] Create `3.2_virtual_environments.md`: `venv`, `pip`, `requirements.txt`.
- [ ] Create `3.5_debugging.md`: Reading tracebacks, print debugging, `pdb`/VS Code debugger.
- [ ] Create `3.6_testing.md`: `pytest` basics, assertions, TDD philosophy.

### Phase 3: Integration
- [ ] Update `python/CURRICULUM.md` to reflect the new sequence.
- [ ] Update `python/CLAUDE.md` if necessary (it lists structure).
- [ ] Verify links (prev/next) in the new and modified markdown files.

## Current Status
Starting Phase 1.
