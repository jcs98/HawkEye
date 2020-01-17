REQ_FILE_NAME = "temp_file.jpg"
RES_FILE_NAME = "temp_file.png"

HRNET_MODEL = {
    "encoder_weights": "ade20k-hrnetv2-c1/encoder_epoch_30.pth",
    "decoder_weights": "ade20k-hrnetv2-c1/decoder_epoch_30.pth",
    "encoder_arch": "hrnetv2",
    "decoder_arch": "c1",
    "encoder_arch": "hrnetv2",
    "fc_dim": 720,
    "num_class": 150
}

DATASET_CONFIG = {
    "num_class": 150,
    "imgSizes": (300, 375, 450, 525, 600),
    "imgMaxSize": 1000,
    "padding_constant": 32,
    "segm_downsampling_rate": 4,
    "random_flip": True
}

colors = [
    [0, 0, 0],
    [255, 255, 255]
]