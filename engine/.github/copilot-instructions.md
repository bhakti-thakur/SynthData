# SynthData.ai Engine – Copilot Notes

- **Scope & entry point**: Core pipeline lives in [engine/generator.py](engine/generator.py); schema discovery in [schema/infer.py](schema/infer.py); CTGAN wrapper in [models/ctgan.py](models/ctgan.py); runnable demo in [test.py](test.py). Imports assume working dir is repo root.
- **Architecture flow**: `SynthDataEngine.fit(df)` → infer schema (categorical detection, min/max, missing stats) → configure CTGAN with discrete columns → train. `generate(n_rows, apply_constraints=True)` → sample via CTGAN → post-process (clip to inferred min/max, round ints, cast categoricals to str).
- **Schema rules**: Numeric columns with unique values ≤ `categorical_threshold` (default 10) are treated as categorical; integer detection falls back to whole-number check. Categorical categories are sorted strings; missingness is tracked but not imputed.
- **CTGAN config**: Wrapper exposes epochs/batch size plus `generator_dim`/`discriminator_dim` defaults (256, 256). Discrete columns passed explicitly from inferred schema. Saving/loading uses CTGAN’s native `.save()`/`.load()`; `load_model()` restores only the GAN—schema must be re-inferred or stored separately.
- **Post-processing conventions**: Constraints apply only if `apply_constraints=True` (default). Numeric columns are clipped to inferred bounds; ints rounded then cast; floats cast; categoricals coerced to strings without strict category validation.
- **Usage patterns**: Typical flow:
  - Fit: `engine = SynthDataEngine(epochs=300, batch_size=500, verbose=True); schema = engine.fit(df)`
  - Generate: `synthetic = engine.generate(n_rows=len(df), apply_constraints=True)`
  - Persist: `engine.save_model(path)` / `engine.load_model(path)` (remember schema handling).
- **Testing/demo workflow**: `python test.py` builds a sample customer dataset if `data/input.csv` is absent, trains with `epochs=100`, prints stats, and writes outputs to `data/synthetic_output.csv`. Keep working dir at repo root so relative paths resolve.
- **Dependencies**: Install via `pip install -r requirements.txt`; CTGAN pulls PyTorch (torch>=2.0). For CPU-only installs on Windows, use the torch index URL noted in [README.md](README.md).
- **Data expectations**: Input is a clean `pandas` DataFrame; missing values are allowed but only tracked. Mixed numeric/categorical support is automatic via schema inference.
- **Extensibility**: Swap the model by replacing [models/ctgan.py](models/ctgan.py) while keeping the `fit/sample/save/load` surface; adjust categorization thresholds or post-processing in [engine/generator.py](engine/generator.py) as needed.
- **Debugging aids**: Set `verbose=True` to surface progress logs during fit/generate; schema remains available via `engine.schema` for inspection.
