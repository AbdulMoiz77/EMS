#ifndef OTA_UPDATE_H
#define OTA_UPDATE_H

#include <Firebase_ESP_Client.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Update.h>

extern FirebaseData fbdoStream;
extern FirebaseData fbdo;
extern bool otaInProgress;
extern String url;

void setupStream();
void streamCallback(FirebaseStream data);
void streamTimeoutCallback(bool timeout);
void updateFirmware();

#endif
