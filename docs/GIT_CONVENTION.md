    # Git Convention

    Use only when creating commits, suggesting commit messages, reviewing commit readiness, or preparing PR notes.

    ## Format

    `<type>(<scope>): <summary>` — scope is required.

    ```txt
    feat(sdk): add client factory
    fix(auth): handle expired sessions
    docs(repo): document git convention
    ```

    ## Types

    Smallest accurate type: `feat` new feature/API · `fix` bug fix · `docs` docs-only · `test` tests-only · `refactor` no behavior change · `chore` maintenance/config/tooling · `build` build system/bundling · `ci` CI/CD.

    ## Scope

    Smallest clear package/app/feature/area affected. No fixed scope list unless the repo defines one. For repo-wide changes, use a broad but clear scope (e.g. `repo`, `config`).
    Avoid vague scopes like `stuff`, `things`.

    ## Summary

    Short, imperative, present tense, no trailing period, describes the actual change, one logical change only.
    Bad: `update stuff`, `fix bug`, `changes`, `final`, `feat(sdk): added a lot of things.`

    ## Commit Size

    One logical change per commit. Don't mix: feature + refactor, formatting + behavior change, docs + unrelated code, dependency changes + unrelated feature work. Multiple files are fine if they belong to the same logical change.

    ## Breaking Changes

    Add `!` after the scope:

    ```txt
    feat(sdk)!: rename client factory
    ```

    Add a body with migration impact:

    ```txt
    BREAKING CHANGE: `createClient` was renamed to `createBelaClient`.
    ```

    ## Body

    Optional — use when the subject alone isn't enough: public API changes, migration impact, non-obvious reasons, important tradeoffs.

    ## AI Agent Rules

    1. Inspect the diff first.
    2. Pick the smallest accurate type and scope.
    3. Suggest one clean commit message.
    4. Don't include unrelated changes.
    5. Don't commit generated files unless explicitly requested.
    6. Never claim a commit was created unless the git command actually ran.

    ## PR Notes

    ```md
    ## Summary

    - What changed
    - Why it changed

    ## Verification

    - Commands run

    ## Notes

    - API changes, risks, or follow-ups
    ```
