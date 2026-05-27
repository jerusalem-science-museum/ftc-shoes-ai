#!/bin/bash

while true; do
    layout=$(setxkbmap -query | grep layout | awk '{print $2}')
    if [ "$layout" == "il" ]; then
        xmodmap -e "keycode ['] = NoSymbol"
        xmodmap -e "keycode [/] = NoSymbol"
    else
        xmodmap -e "keycode ['] = apostrophe"  # Revert to default behavior
        xmodmap -e "keycode [/] = slash"  # Revert to default behavior
    fi
    sleep 1  # Check every second
done
