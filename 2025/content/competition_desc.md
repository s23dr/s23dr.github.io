# Structured Semantic 3D Reconstruction (S23DR) Challenge 2025

## Objective
What's next after Structure from Motion?

The objective of this competition is to facilitate the development of methods for transforming posed images (sometimes also called "oriented images") / SfM outputs into a structured geometric representation (wire frame) from which semantically meaningful measurements can be extracted.

In short: More Structured Structure from Motion.

## Data

### HoHo 25k Subset
Please see the Dataset Card by clicking the link in the left panel or at the [hoho25k repo](https://huggingface.co/datasets/usm3d/hoho25k).


## Submission
This is a [script competition](https://huggingface.co/docs/competitions/en/create_competition#:~:text=all%20the%20time.-,script,-%3A%20script%20competitions%20are). 

>Script competitions are competitions where the participants submit a python script that takes in the test set and outputs the predictions. The predictions are then evaluated against `solution.csv` (or a solution file) using the evaluation metric provided by the competition creator... The participants submit a huggingface model repo containing script.py which is run to generate predictions on hidden test data.

To participate in this competition you will submit a huggingface model repo containing a `script.py` file which will compute your solution on the test data for the public and private leaderboads. Your solution will be evaluated based on Hybrid Structure Score.


Check our example solutions:

- [empty solution](https://huggingface.co/usm3d/empty_submission_2025/)
- [handcrafted solution](https://huggingface.co/usm3d/handcrafted_submission_2025)


## Metric
 
Hybrid Structure Score or HSS is defined as 

```
HSS(gt_verts, gt_edges, pred_verts, pred_edges) := harmonic_mean(f1(gt_verts, pred_verts), IoU(gt_edges, pred_edges))
```

where a predicted vertex is considered a true positive if it is within 25cm of a ground truth vertex, and the edges are represented as cylendars with radius 25cm.


Hybrid Structure Score or HSS is defined as 

```
HSS(gt_verts, gt_edges, pred_verts, pred_edges) := harmonic_mean(f1(gt_verts, pred_verts), IoU(gt_edges, pred_edges))
```

where a predicted vertex is considered a true positive if it is within 50cm (0.5m) of a ground truth vertex, and the edges are represented as cylinders with radius 50cm (0.5m).


Finally, we compute this metric separately for each scene and average over scenes to compute the final score. The biggest HSS wins.
You can check the exact implementation [here](https://huggingface.co/usm3d/tools2025/blob/main/hoho2025/metric_helper.py#L157)

If you are interested in the motivation behind this particular metric, check the paper [Explaining Human Preferences via Metrics for Structured 3D Reconstruction](https://arxiv.org/abs/2503.08208)



### Submission file  

For each scene in the test set, you have to predict the wireframe. The file `submission.parquet` should be in <a href="https://parquet.apache.org"  target="_blank">parquet format</a> have the following format:


```python
{
    "order_id": "some_hash",
    "wf_vertices": np.array([[0., 0., 0.], [1., 0., 0], [0., 1., 0]]),
    "wf_edges": np.array([[0, 1], [1, 2], [0, 1]])
}
```

### Evaluation hardware
Submitted script is run on the instance with 8 vCPU, 30 GB RAM and Nvidia T4 GPU with 16 GB	VRAM for 2 hours. 
If submission is not finished within 2 hours, it produces no score. 

## Organizers
Jack Langerman (Independent Researcher*), Dmytro Mishkin (CTU in Prague / Hover), Yuzhong Huang (USC / Hover)

*Now at Apple, formally at Hover

## Sponsors 
The organizers would like to thank Hover Inc. for their sponsorship of this challenge and dataset.

## Timeline
- Competition Released: April 09, 2025
- Team Merging: May 25, 2025 
- Final Solution Submission: June 05, 2025
- Writeup Deadline: June 9, 2025


The deadline is supposed to be end of 5th June, anytime on Earth, which translates to 6th June midday UTC
The HF competition system expects us to set deadline in UTC date, so it is set to 7th UTC, effectively +12 hours from official date set.
## Prizes

### $25,000 Prize Pool

- 1st Place: **$10,000**
- 2nd Place: **$7,000**
- 3rd Place: **$5,000**
- Additional Prizes: **$3,000**

Please see the [Competition Rules](https://usm3d.github.io/S23DR/2025/s23dr_rules.md) for additional information.


### Cite
```
@misc{S23DR_2025, 
        title={S23DR Competition at 2nd Workshop on Urban Scene Modeling @ CVPR 2025}, 
        url={usm3d.github.io},
        howpublished = {\url{https://huggingface.co/usm3d}},
        year={2025},
        author={Langerman, Jack and Mishkin, Dmytro and Yuzhong, Huang}
    }
```