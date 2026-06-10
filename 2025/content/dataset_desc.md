# Dataset Card

**Number of samples**: 25095

**Columns / Features**:
- **order_id**: Value(dtype='string', id=None)
- **image_ids**: Sequence(feature=Value(dtype='string', id=None), length=-1, id=None)
- **ade**: Sequence(feature=Image(mode=None, decode=True, id=None), length=-1, id=None)
- **depth**: Sequence(feature=Image(mode=None, decode=True, id=None), length=-1, id=None)
- **gestalt**: Sequence(feature=Image(mode=None, decode=True, id=None), length=-1, id=None)
- **K**: Sequence(feature=Array2D(shape=(3, 3), dtype='float32', id=None), length=-1, id=None)
- **R**: Sequence(feature=Array2D(shape=(3, 3), dtype='float32', id=None), length=-1, id=None)
- **t**: Sequence(feature=Array2D(shape=(3, 1), dtype='float32', id=None), length=-1, id=None)
- **wf_vertices**: Sequence(feature=Sequence(feature=Value(dtype='float32', id=None), length=3, id=None), length=-1, id=None)
- **wf_edges**: Sequence(feature=Sequence(feature=Value(dtype='int64', id=None), length=2, id=None), length=-1, id=None)
- **wf_classifications**: Sequence(feature=Value(dtype='int64', id=None), length=-1, id=None)
- **colmap_binary**: Value(dtype='binary', id=None)


These data were gathered over the course of several years throughout the United States from a variety of smart phone and camera platforms.
Each training sample/scene consists of a set of posed image features (segmentation, depth, etc.) and a sparse point cloud as input,
and a sparse wire frame (3D embedded graph) with semantically tagged edges as the target.
In order to preserve privacy, original images are not provided.

Note: the test distribution is not guaranteed to match the training set.



## Usage example 

```python
from datasets import load_dataset

def read_colmap_rec(colmap_data):
    import pycolmap
    import tempfile,zipfile
    import io
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(io.BytesIO(colmap_data), "r") as zf:
            zf.extractall(tmpdir)  # unpacks cameras.txt, images.txt, etc. to tmpdir
        # Now parse with pycolmap
        rec = pycolmap.Reconstruction(tmpdir)
        return rec


ds = load_dataset("usm3d/hoho25k",streaming=False, trust_remote_code=True, num_proc=16)
# or we can use streaming as well
# ds = load_dataset("usm3d/hoho25k",streaming=True, trust_remote_code=True)
print (ds['train'][0].keys())
rec = read_colmap_rec(ds['train'][0]['colmap_binary'])
print (rec)

```

This would result in 


```
order_id
image_ids
ade
depth
gestalt
K
R
t
wf_vertices
wf_edges
wf_classifications
colmap_binary
Reconstruction(num_cameras=1, num_images=8, num_reg_images=8, num_points3D=15842)
```

The colmap reconstruction and camera poses in dataset are require the transformation to be compatible.
For more details check the [/usm3d/hoho25k](https://huggingface.co/datasets/usm3d/hoho25k) and the helpers library
[hoho2025](https://huggingface.co/usm3d/tools2025)



### Additional notes on data


#### Depth
The depth is a result of running monocular depth model [Metric3Dv2](https://huggingface.co/spaces/JUGGHM/Metric3D),
and it is not ground truth by no means. The depth is stored in millimeters, so to get the metric data, use

```python
np.array(entry['depth']).astype(float32)/1000.

```

If you need to have a GT depth, the semi-sparse depth from the Colmap reconstructions with dense features
available in points3d is quite accurate. 


### Segmentation
You have two segmentations available. gestalt is domain specific model, which "sees-through-occlusions" and provides a detailed information about house parts. 
See the list of classes in "Dataset" section in the navigation bar.

ade20k is a standard ADE20K segmentation model (specifically, [shi-labs/oneformer_ade20k_swin_large](https://huggingface.co/shi-labs/oneformer_ade20k_swin_large).

### Organizers
Jack Langerman (Apple Inc), Dmytro Mishkin (CTU in Prague / Hover), Yuzhong Huang (Hover Inc.).

### Sponsors
The organizers would like to thank [Hover Inc.](https://hover.to) for their sponsorship of this challenge and dataset.

```bibtex
@misc{S23DR_2025, 
        title={S23DR Competition at 2nd Workshop on Urban Scene Modeling @ CVPR 2025}, 
        url={usm3d.github.io},
        howpublished = {\url{https://huggingface.co/usm3d}},
        year={2025},
        author={Langerman, Jack and Mishkin, Dmytro and Yuzhong, Huang}
    }
```