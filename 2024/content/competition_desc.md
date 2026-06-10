# Structured Semantic 3D Reconstruction (S23DR) Challenge

## Objective
What's next after Structure from Motion?

The objective of this competition is to facilitate the development of methods for transforming posed images (sometimes also called "oriented images") / SfM outputs into a structured geometric representation (wire frame) from which semantically meaningful measurements can be extracted.

In short: More Structured Structure from Motion.

## Data

### HoHo 5k Subset
This is a living dataset. Today, we provide 4316 samples for training, and 175 for validation and hold back an additional 1072 for computing the private and public leaderboards. Additional, we intend to continue releasing *training* data throughout the challenge and beyond. The data take the following form:


```python
Features({
        "order_id": Value(dtype="string"),
        # inputs 
        "K": Sequence(Array2D(dtype="float32", shape=(3, 3))),
        "R": Sequence(Array2D(dtype="float32", shape=(3, 3))),
        "t": Sequence(Sequence(Value(dtype="float32"), length=(3))), # in centimeters
        "gestalt": Sequence(Image()), 
        "ade20k": Sequence(Image()),  
        "depthcm": Sequence(Image()),  # in centimeters
        # result of Colmap reconstruction loaded in named tuples
        # More on format: https://github.com/colmap/colmap/blob/main/scripts/python/read_write_model.py#L47
        "images": Dict(namedtuple("Image", ["id", "qvec", "tvec", "camera_id", "name", "xys", "point3D_ids"])),
        "points3d": Dict(namedtuple( "Point3D", ["id", "xyz", "rgb", "error", "image_ids", "point2D_idxs"])),
        "cameras": Dict(namedtuple("Camera", ["id", "model", "width", "height", "params"])),
 
        # side info during training
        "mesh_vertices": Sequence(Sequence(Value(dtype="float32"), length=3)),
        "mesh_faces": Sequence(Sequence(Value(dtype="int64"))),
        "face_semantics": Sequence(Value(dtype='int64')),
        "edge_semantics": Sequence(Value(dtype='int64')),

        # targets
        "wf_vertices": Sequence(Sequence(Value(dtype="float32"), length=3)),  # in centimeters
        "wf_edges": Sequence(Sequence(Value(dtype="int64"), length=2)),
   })
```
These data were gathered over the course of several years throughout the United States from a variety of smart phone and camera platforms. Each training sample/scene consists of a set of posed image features (segmentation, depth, etc.) and a sparse point cloud as input, and a sparse wire frame (3D embedded graph) with semantically tagged edges as the target. Additionally a mesh with semantically tagged faces is provided for each scene durning training. In order to preserve privacy, original images are not provided.

Note: the test distribution is not guaranteed to match the training set.

### Sample visualizations 

Two visualizations of houses below are interactive! Grab one with your mouse and rotate!
<div style='width: 100%;'>
    <div style='margin: auto;'>
        <iframe style="width: 45%; height:  512px; display: inline; margin: 0px; padding: 0px;" frameBorder="0" src="https://usm3d.github.io/S23DR/inputs_8d74b83100f.html">no iframe support</iframe>
        <iframe style="width: 45%; height:  512px; display: inline; margin: 0px; padding: 0px;" frameBorder="0" src="https://usm3d.github.io/S23DR/outputs_8d74b83100f.html">no iframe support</iframe>
    </div>
</div>
<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/input_images_8d74b83100f.webp" alt="Input Images" style="width: 100%;">


<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/order_vis1.png" alt="Order 1" style="width: 33%; display: inline;">
<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/order_vis2.png" alt="Order 2" style="width: 33%; display: inline;">
<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/order_vis3.png" alt="Order 3" style="width: 33%; display: inline;">
<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/images_vis.png" alt="Input Images" style="width: 100%;">
<img src="https://raw.githubusercontent.com/usm3d/usm3d.github.io/main/images/hf_hotlinks/roof_diagram.png" alt="Order 3" style="width: 100%;">

The roofs below are interactive as well!

<iframe style="width: 100%; height:  512px;" src="https://usm3d.github.io/S23DR/houses.html">no iframe support</iframe>


### Additional notes on data

#### Depth
The `depthcm` is a result of running monocular depth model, and it is not ground truth by no means. If you need to have a GT depth, you can render the GT mesh in the training set using `mesh_faces` and `mesh_vertices`. 
The semi-sparse depth from the Colmap reconstructions with dense features, available in `points3d` is much more accurate, than `depthcm`. 

At the inference time, `mesh_faces` is not available, so you can use only `depthcm` and colmap point cloud from `points3d`

#### Segmentation

You have two segmentations available. `gestalt` is domain specific model, which "sees-through-occlusions" and provides a detailed information about house parts. See the list of classes in "Dataset" section in the navigation bar.

`ade20k` is a standard ADE20K segmentation model (specifically, [shi-labs/oneformer_ade20k_swin_large](https://huggingface.co/shi-labs/oneformer_ade20k_swin_large)).

## Submission
This is a [script competition](https://huggingface.co/docs/competitions/en/create_competition#:~:text=all%20the%20time.-,script,-%3A%20script%20competitions%20are). 

>Script competitions are competitions where the participants submit a python script that takes in the test set and outputs the predictions. The predictions are then evaluated against `solution.csv` (or a solution file) using the evaluation metric provided by the competition creator. These competitions are only free to host if you use cpu-basic as the backend for evaluation, and this is not recommended! In script competition, the test data can be kept private. The participants wont be able to see the test data at all. The participants submit a huggingface model repo containing script.py which is run to generate predictions on hidden test data.

To participate in this competition you will submit a huggingface model repo containing a `script.py` file which will compute your solution on the test data for the public and private leaderboads. Your solution will be evaluated based on a [modified version](https://huggingface.co/usm3d/tools/blob/main/hoho/wed.py) of the Wire Frame Edit Distance (WED).

### Metric

Here is a description of the WED metric, adopted from paper <a href="https://openreview.net/pdf?id=8X2eaSZxTP" target="_blank">"PC2WF: 3D Wireframe Reconstruction from Raw Point Clouds"</a>, the figure is also taken from the paper.

*(Figure from the [PC2WF paper](https://openreview.net/pdf?id=8X2eaSZxTP))*

- First, the vertices are matched to ground truth using a Sinkhorn algorithm (this is different from the paper which uses Nearest Neighbors). 
- Then the matched vertices are moved to GT locations
- The missing vertices are inserted
- Missing edges are inserted and wrong ones are deleted. 

The cost is a sum of length of inserted and deleted edges, added to the vertex movement distance, and normalized by the total length of the ground truth edges.
You can check the function, which calculates the metric in the <a href="https://huggingface.co/usm3d/tools/blob/main/hoho/wed.py" target="_blank">hoho package</a>.

Please see <a href="https://huggingface.co/usm3d/handcrafted_baseline_submission">this repo</a> for an illustrative submission example.


Finally, we compute this metric separately for each scene and average over scenes to compute the final score. The smallest WED wins. 


### Submission file  

For each scene in the test set, you have to predict the wireframe. The file `submission.parquet` should be in <a href="https://parquet.apache.org"  target="_blank">parquet format</a> have the following format:


```python
{
    "__key__": "scene1",
     "wf_vertices": np.array([[0., 0., 0.], [1., 0., 0], [0., 1., 0]]),
     "wf_edges": np.array([[0, 1], [1, 2], [0, 1]])
}
```

### Evaluation hardware
Submitted script is run on the instance with 8 vCPU, 30 GB RAM and Nvidia T4 GPU with 16 GB	VRAM for 2 hours. 
If submission is not finished within 2 hours, it produces no score. 

## Organizers
Jack Langerman (Hover), Dmytro Mishkin (CTU in Prague / Hover), Ilke Demir (Intel), Hanzhi Chen (TUM), Daoyi Gao (TUM), Caner Korkmaz (ICL), Tolga Birdal (ICL)

## Sponsors 
The organizers would like to thank [Hover Inc.](https://hover.to) for their sponsorship of this challenge and dataset.

## Timeline
- Competition Released: March 14, 2024
- Team Merging: June 4, 2024 
- ~~Team Merging: May 28, 2024~~
- Final Solution Submission: June 10, 2024
- ~~Final Solution Submission: June 4, 2024~~
- Writeup Deadline: June 13, 2024
- ~~Writeup Deadline: June 11, 2024~~
  
## Prizes
- 1st Place: **$10,000**
- 2nd Place: **$7,000**
- 3rd Place: **$5,000**
- Additional Prizes: **$3,000**

Please see the [Competition Rules](https://usm3d.github.io/S23DR/s23dr_rules.html) for additional information.


### Cite
```
@misc{Langerman_Korkmaz_Chen_Gao_Demir_Mishkin_Birdal2024, 
        title={S23DR Competition at 1st Workshop on Urban Scene Modeling @ CVPR 2024}, 
        url={usm3d.github.io},
        howpublished = {\url{https://huggingface.co/usm3d}},
        year={2024},
        author={Langerman, Jack and Korkmaz, Caner and Chen, Hanzhi and Gao, Daoyi and Demir, Ilke and Mishkin, Dmytro and Birdal, Tolga}
    } 
```