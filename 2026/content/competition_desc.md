# Structured Semantic 3D Reconstruction (S23DR) Challenge 2026

## Objective

What's next after Structure from Motion?

The objective of this competition is to facilitate the development of methods for transforming posed images (sometimes also called "oriented images") / SfM outputs into a structured geometric representation (wire frame) from which semantically meaningful measurements can be extracted.

In short: More Structured Structure from Motion.

## Data

Please see the Dataset Card by clicking the link in the left panel.

## Submission

This is a [script competition](https://huggingface.co/docs/competitions/en/create_competition#:~:text=all%20the%20time.-,script,-%3A%20script%20competitions%20are).

To participate you submit a HuggingFace model repo containing a `script.py` file which will compute your solution on the test data. Your solution will be evaluated based on Hybrid Structure Score (HSS).

## Metric

Hybrid Structure Score (HSS) is defined as:

```
HSS(gt_verts, gt_edges, pred_verts, pred_edges) := harmonic_mean(f1(gt_verts, pred_verts), IoU(gt_edges, pred_edges))
```

where a predicted vertex is considered a true positive if it is within 50 cm of a ground truth vertex, and edges are represented as cylinders with radius 50 cm.

The metric is computed separately for each scene and averaged. Higher is better.

## Timeline

| Phase | Date |
|-------|------|
| Competition Opens | 12 Mar 2026 |
| Team Merging Deadline | 20 May 2026 |
| Final Submission | 28 May 2026 |
| Writeup Deadline | 30 May 2026 |

## Organizers

Jack Langerman (Apple Inc), Dmytro Mishkin (CTU in Prague / Hover), Yuzhong Huang (Hover Inc.), Anastasiia Mishchuk (Hover Inc.)

## Sponsors

The organizers would like to thank [Hover Inc.](https://hover.to) for their sponsorship of this challenge and dataset.

## Prizes

### $12,000 Prize Pool

- 1st Place: **$5,000**
- 2nd Place: **$3,000**
- 3rd Place: **$2,000**
- Additional Prizes: **$2,000**

Only submissions that outperform the baseline method will be considered for monetary awards.

Please see the [Competition Rules](rules.html) for additional information.

### Cite

```
@misc{S23DR_2026,
    title={S23DR Competition at 3rd Workshop on Urban Scene Modeling @ CVPR 2026},
    url={usm3d.github.io},
    howpublished = {\url{https://huggingface.co/usm3d}},
    year={2026},
    author={Langerman, Jack and Mishkin, Dmytro and Huang, Yuzhong}
}
```
