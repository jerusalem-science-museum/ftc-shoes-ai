#include <Keyboard.h>  // Include the Keyboard library

const int ALT_SHIFT_KEY = 2;   // Pin connected to the button for Alt+Shift
const int REBOOT_KEY = 3;      // Pin connected to the button for reboot
int altShiftState = LOW;       // Current state of the button for Alt+Shift
int altShiftPrev = LOW;        // Previous state of the button for Alt+Shift

void setup() {
  // Setup button pins
  pinMode(ALT_SHIFT_KEY, INPUT_PULLUP);
  pinMode(REBOOT_KEY, INPUT_PULLUP);
  // Initialize the keyboard
  Keyboard.begin();
}

void loop() {
  // Read the state of the Alt+Shift button
  altShiftState = digitalRead(ALT_SHIFT_KEY);

  // Check if the Alt+Shift button is pressed
  if (altShiftState == LOW && altShiftPrev == HIGH) {
    // Debounce
    delay(50);
    if (digitalRead(ALT_SHIFT_KEY) == LOW) {
      // Press and release Alt+Shift keys
      Keyboard.press(KEY_LEFT_ALT);
      Keyboard.press(KEY_LEFT_SHIFT);
      delay(100); // Wait for stable
      Keyboard.releaseAll();
      delay(100); // Wait for debounce
    }
  }

  // Store current state for comparison in the next iteration
  altShiftPrev = altShiftState;

  // Read the state of the reboot button
  int rebootState = digitalRead(REBOOT_KEY);

  // Check if the reboot button is pressed
  if (rebootState == LOW) {
    delay(50); // Debounce delay
    if (digitalRead(REBOOT_KEY) == LOW) {
      // Ensure the layout is set to English before rebooting
      Keyboard.press(KEY_LEFT_ALT);
      Keyboard.press(KEY_LEFT_SHIFT);
      delay(100); // Wait for stable
      Keyboard.releaseAll();
      delay(100); // Wait for debounce

      // Open Terminal (Ctrl + Alt + T)
      Keyboard.press(KEY_LEFT_CTRL);
      Keyboard.press(KEY_LEFT_ALT);
      Keyboard.press('t');
      delay(100);
      Keyboard.releaseAll();
      delay(1000); // Wait for Terminal to open

      // Type pkill firefox to close Firefox
      Keyboard.print("pkill firefox");
      delay(100); // Wait for typing
      Keyboard.press(KEY_RETURN);
      delay(100); // Ensure the command is sent
      Keyboard.releaseAll();
      delay(2000); // Wait 2 seconds for Firefox to close

      // Type sudo reboot to reboot the system
      Keyboard.print("sudo reboot");
      delay(100); // Wait for typing
      Keyboard.press(KEY_RETURN);
      delay(100); // Ensure the command is sent
      Keyboard.releaseAll();
      delay(100); // Final debounce delay
    }
  }
}
