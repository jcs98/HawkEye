#!/bin/bash

MODEL_PATH=ade20k-hrnetv2-c1

ENCODER=$MODEL_PATH/encoder_epoch_30.pth
DECODER=$MODEL_PATH/decoder_epoch_30.pth

# Download model weights and image
if [ ! -e $MODEL_PATH ]; then
  mkdir $MODEL_PATH
fi
if [ ! -e $ENCODER ]; then
  wget -P $MODEL_PATH http://sceneparsing.csail.mit.edu/model/pytorch/$ENCODER
fi
if [ ! -e $DECODER ]; then
  wget -P $MODEL_PATH http://sceneparsing.csail.mit.edu/model/pytorch/$DECODER
fi
