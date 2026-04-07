#!/bin/bash
# Update common content
python donavpane.py
# Run Eleventy
npx @11ty/eleventy
# Push
if [ "$1" == "ship" ]; then
    neocities push .
fi
echo "Don't forget to make a commit <3"