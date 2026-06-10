# Dataset Card — HoHo 22k (2026)

The S23DR 2026 challenge uses the **HoHo 22k** dataset: ~22,000 annotated building scenes with ground-truth wireframes hand-authored from human models.

[View dataset on HuggingFace →](https://huggingface.co/datasets/usm3d/hoho22k_2026_trainval)

## What's in Each Scene

Each scene provides:

- **ADE20k segmentation** — semantic segmentation maps
- **Gestalt segmentation** — roof-part segmentation (ridge, eave, rake, apex, etc.)
- **Monocular depth** — per-image depth estimates
- **Semi-dense SfM point cloud** — from COLMAP reconstruction
- **Posed images** — with camera parameters (BPO pose when available)
- **Ground-truth wireframe** — annotated vertices and edges

## Changes from 2025

- **Smaller but cleaner**: ~22k scenes (down from ~25k). More reconstructions reviewed; unverifiable ones removed. Quality over quantity.
- **Same train/test split**: Identical to 2025, minus the removed reconstructions.
- **Higher-quality COLMAP reconstructions**: More complete and precise point clouds. Sky/background points intentionally left unfiltered.
- **More images per scene**: Significantly more per-scene views including all segmentation and depth modalities.

## Getting Started

```python
pip install hoho2025
```

```python
from datasets import load_dataset
from hoho2025.vis import plot_all_modalities

ds = load_dataset("usm3d/hoho22k_2026_trainval", streaming=True, trust_remote_code=True)
# Available splits: ds['train'], ds['validation']
for scene in ds['train']:
    ...
```

## Baseline Code

[github.com/s23dr/hoho2025](https://github.com/s23dr/hoho2025) — tools and utilities for submission and evaluation.

## Notes

- The test distribution is not guaranteed to match the training set.
- Cameras without a BPO pose have all-zero values and `pose_only_in_colmap=True`.
