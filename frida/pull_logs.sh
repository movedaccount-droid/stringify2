rm -rf ./logs
adb pull /storage/emulated/0/Android/data/com.webkinz.webkinznext/files/logs
adb shell rm -rR -f /storage/emulated/0/Android/data/com.webkinz.webkinznext/files/logs/*
