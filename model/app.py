import os
import numpy as np
from PIL import Image
import torch
import torch.nn as nn

from dataset import TestDataset
from models import ModelBuilder, SegmentationModule
from utils import colorEncode
from lib.nn import user_scattered_collate, async_copy_to
from lib.utils import as_numpy

from constants import RES_PATH, DATASET_CONFIG, colors


cwd = os.getcwd()
colors = np.array(colors).astype(np.uint8)

def save_img(img, pred):
    pred[pred != 2] = 0
    pred[pred == 2] = 1
    pred = np.int32(pred)
    res_img = colorEncode(pred, colors).astype(np.uint8)
    Image.fromarray(res_img).save(os.path.join(cwd, RES_PATH))

def test(segmentation_module, loader, gpu):
    segmentation_module.eval()

    for batch_data in loader:
        batch_data = batch_data[0]
        segSize = (batch_data['img_ori'].shape[0],
                   batch_data['img_ori'].shape[1])
        img_resized_list = batch_data['img_data']

        with torch.no_grad():
            scores = torch.zeros(1, DATASET_CONFIG["num_class"], segSize[0], segSize[1])
            # scores = async_copy_to(scores, gpu)

            for img in img_resized_list:
                feed_dict = batch_data.copy()
                feed_dict['img_data'] = img
                del feed_dict['img_ori']
                del feed_dict['info']
                # feed_dict = async_copy_to(feed_dict, gpu)

                # forward pass
                pred_tmp = segmentation_module(feed_dict, segSize=segSize)
                scores = scores + pred_tmp / len(DATASET_CONFIG["imgSizes"])

            _, pred = torch.max(scores, dim=1)
            pred = as_numpy(pred.squeeze(0).cpu())
        save_img(batch_data['img_ori'], pred)

def loadModel(model):
    net_encoder = ModelBuilder.build_encoder(
        arch=model["encoder_arch"],
        fc_dim=model["fc_dim"],
        weights=os.path.join(cwd, model["encoder_weights"])
        )
    net_decoder = ModelBuilder.build_decoder(
        arch=model["decoder_arch"],
        fc_dim=model["fc_dim"],
        num_class=model["num_class"],
        weights=os.path.join(cwd, model["decoder_weights"]),
        use_softmax=True)

    crit = nn.NLLLoss(ignore_index=-1)

    segmentation_module = SegmentationModule(net_encoder, net_decoder, crit)
    return segmentation_module

def getLoader(imgs):
    imgs = [{'fpath_img': x} for x in imgs]
    # preprocessing
    dataset = TestDataset(imgs, DATASET_CONFIG)
    loader = torch.utils.data.DataLoader(
        dataset,
        batch_size=1,
        shuffle=False,
        collate_fn=user_scattered_collate,
        num_workers=5,
        drop_last=True
        )
    return loader


def generateSky(img, model):
    img = [os.path.join(cwd, img)]
    loader = getLoader(img)
    gpu = 0
    # torch.cuda.set_device(gpu)    
    test(model, loader, gpu)

def angle_of_elevation(mask_path):
    image = Image.open(mask_path)
    img_array = np.array(image)

    image_height = img_array.shape[0]

    lowest = float('inf')

    for col in img_array.T:
        try:
            index = list(col)[::-1].index(True)
            if(index < lowest):
                lowest = index
        except ValueError:
            continue

    angle_of_elevation = (lowest / image_height) * 90
    return angle_of_elevation

if __name__=="__main__":
    from constants import HRNET_MODEL as MODEL
    model = loadModel(MODEL)

    img = "test_img.jpg"

    import time
    start = time.time()
    generateSky(img, model)
    end = time.time()
    print(end-start)
