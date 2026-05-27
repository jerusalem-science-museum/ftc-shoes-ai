#!/bin/bash

# Open the second Firefox instance with the main URL (upper screen)
firefox --new-window --kiosk "http://localhost:5173/" &
sleep 3  # Adjust the sleep duration as needed to allow Firefox to open

# Move the second Firefox instance to the upper screen and make it fullscreen
firefox_window_id_2=$(wmctrl -l | grep "Mozilla Firefox" | awk '{print $1}' | tail -n 1)
xdotool windowmove $firefox_window_id_2 0 0  # Position on the upper screen
xdotool windowsize $firefox_window_id_2 1920 1080  # Adjust the resolution as needed

# Block window resizing and minimizing for the second Firefox instance
wmctrl -r "$firefox_window_id_2" -b add,above  # Keep window above other windows
wmctrl -r "$firefox_window_id_2" -b add,sticky  # Prevent the window from being minimized

# Open the first Firefox instance with create-post URL (lower screen)
firefox --new-window --kiosk "http://localhost:5173/create-post" &
sleep 3  # Adjust the sleep duration as needed

# Move the first Firefox instance to the lower screen and make it fullscreen
firefox_window_id_1=$(wmctrl -l | grep "Mozilla Firefox" | awk '{print $1}')
xdotool windowmove $firefox_window_id_1 0 1080  # Position on the lower screen
xdotool windowsize $firefox_window_id_1 1920 1080  # Adjust the resolution as needed

# Block window resizing and minimizing for the first Firefox instance
wmctrl -r "$firefox_window_id_1" -b add,above  # Keep window above other windows
wmctrl -r "$firefox_window_id_1" -b add,sticky  # Prevent the window from being minimized
wmctrl -r "Mozilla Firefox" -b add,fullscreen
wmctrl -a "Mozilla Firefox"  # Active Firefox	

done