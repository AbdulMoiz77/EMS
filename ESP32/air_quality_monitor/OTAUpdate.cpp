#include "OTAUpdate.h"

void setupStream() {
    if (!Firebase.RTDB.beginStream(&fbdoStream, "/Firmware")) {
        Serial.println("Failed to begin Stream: " + fbdoStream.errorReason());
    }
    Firebase.RTDB.setStreamCallback(&fbdoStream, streamCallback, streamTimeoutCallback);
}

void streamCallback(FirebaseStream data) {
    Serial.println("Event received");

    if (data.dataTypeEnum() == fb_esp_rtdb_data_type_boolean) {
        bool updateFlag = data.boolData();
        Serial.print("Update flag: ");
        Serial.println(updateFlag ? "TRUE" : "FALSE");

        if (updateFlag) {
        Serial.println("Update triggered!");

            if(Firebase.RTDB.getString(&fbdo, "Firmware/url")){
                if(fbdo.dataType() == "string"){
                    url = fbdo.stringData();
                    Serial.println("Successful read from" + fbdo.dataPath() + " : " + url + " (" + fbdo.dataType() + ")");
                    updateFirmware();
                }
            }else{
                Serial.println("Failed: " + fbdo.errorReason());
            }
        }
    }
}

void streamTimeoutCallback(bool timeout) {
    if (timeout) {
        Serial.println("Stream timed out, resuming...");
    }
}

void updateFirmware() {
    otaInProgress = true;
    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;

    http.begin(client, url);
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS); 

    int responseCode = http.GET();
    if(responseCode == HTTP_CODE_OK){
        int length = http.getSize();
        bool beginUpdate = Update.begin(length);

        if(beginUpdate){
            Serial.println("Starting Firmware Update");
            WiFiClient *stream = http.getStreamPtr();
            size_t written = Update.writeStream(*stream);

            if(written == length){
                Serial.println("Firmware written successfully");
            }else {
                Serial.println("Writen only " + String(written) + "/" + String(length) + " bytes");
            }

            if(Update.end()){
                if(Update.isFinished()){
                    Serial.println("Update Completed. Rebooting.....");
                    Firebase.RTDB.setBool(&fbdo, "/Firmware/update", false);
                    delay(200);
                    ESP.restart();
                }else{
                    Serial.println("Update not finished");
                }
            }else{
                Serial.printf("Error in Update: %s\n",  Update.errorString());
                Serial.println("Restarting...");
                updateFirmware();
            }
        }else{
            Serial.println("Not enough space");
        }
    }else{
        Serial.println("HTTP error" + String(responseCode));
        Serial.println("Retrying...");
        updateFirmware();
    }
    otaInProgress = false;
}