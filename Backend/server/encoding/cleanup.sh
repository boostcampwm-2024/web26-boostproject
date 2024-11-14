#!/bin/bash

LOG_FILE="/lico/script/cleanup.log"
exec > >(tee -a "$LOG_FILE") 2>&1


APP_NAME=$1
STREAM_KEY=$2

sleep 30; # 송출 종료 30초 후 방종 처리

echo "Cleanup FFmpeg script for APP_NAME: $APP_NAME, STREAM_KEY: $STREAM_KEY"
# API 요청으로 채널 아이디 획득
if [[ "$APP_NAME" == "live" ]]; then
    CHANNEL_ID=$(curl -s http://192.168.1.9:3000/lives/channel-id/$STREAM_KEY | jq -r '.channelId')
elif [[ "$APP_NAME" == "dev" ]]; then
    CHANNEL_ID=$(curl -s http://192.168.1.7:3000/lives/channel-id/$STREAM_KEY | jq -r '.channelId')
else
    echo "Error: Unsupported APP_NAME. Exiting."
    exit 1
fi


if [[ "$APP_NAME" == "live" ]]; then
    curl -X DELETE http://192.168.1.9:3000/lives/onair/$CHANNEL_ID
elif [[ "$APP_NAME" == "dev" ]]; then
    curl -X DELETE http://192.168.1.7:3000/lives/onair/$CHANNEL_ID
else
    echo "Error: Unsupported APP_NAME. Exiting."
    exit 1
fi

if [[ -d "/lico/storage/$APP_NAME/$CHANNEL_ID" ]]; then
    rm -rf "/lico/storage/$APP_NAME/$CHANNEL_ID"
    echo "Deleted directory: /lico/storage/$APP_NAME/$CHANNEL_ID"
else
    echo "Directory /lico/storage/$APP_NAME/$CHANNEL_ID does not exist, skipping deletion."
fi