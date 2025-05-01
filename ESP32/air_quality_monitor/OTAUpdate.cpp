#include "OTAUpdate.h"

void setupStream() {
    if (!Firebase.RTDB.beginStream(&fbdoStream, "/Firmware")) {
        Serial.println("Failed to begin Stream: " + fbdoStream.errorReason());
    }
    Firebase.RTDB.setStreamCallback(&fbdoStream, streamCallback, streamTimeoutCallback);
}

void streamCallback(FirebaseStream data) {
    Serial.println("Event received");

    if (data.dataTypeEnum() == fb_esp_rtdb_data_type_boolean && Firebase.ready()) {
        bool updateFlag = data.boolData();
        Serial.print("Update flag: ");
        Serial.println(updateFlag ? "TRUE" : "FALSE");

        if (updateFlag) {
        Serial.println("Update triggered!");

            if(Firebase.ready()){
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

    if(Firebase.ready()){
        Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Starting OTA update");
    }

    if(responseCode == HTTP_CODE_OK){
        int length = http.getSize();
        bool beginUpdate = Update.begin(length);

        if(beginUpdate){
            if(Firebase.ready()){
                Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Writing firmware...");
            }

            Serial.println("Starting Firmware Update");
            WiFiClient *stream = http.getStreamPtr();
            size_t written = Update.writeStream(*stream);

            if(written == length){
                if(Firebase.ready()){
                    Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Firmware written successfully");
                }

                Serial.println("Firmware written successfully");
            }else {
                if(Firebase.ready()){
                    Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Partial write: " + String(written) + "/" + String(length));
                }
                Serial.println("Writen only " + String(written) + "/" + String(length) + " bytes");

            }

            if(Update.end()){
                if(Update.isFinished()){
                    if(Firebase.ready()){
                        Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Update complete, rebooting");
                        Firebase.RTDB.setBool(&fbdo, "/Firmware/update", false);
                    }
                    Serial.println("Update Completed. Rebooting.....");
                    delay(200);
                    ESP.restart();
                }else{
                    Serial.println("Update not finished");
                    if(Firebase.ready()){
                        Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Update not finished");
                    }
                }
            }else{
                Serial.printf("Error in Update: %s\n",  Update.errorString());
                if(Firebase.ready()){
                    Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Error: " + String(Update.errorString()));
                }
            }
        }else{
            Serial.println("Not enough space");
            if(Firebase.ready()){
                Firebase.RTDB.setString(&fbdo, "/Firmware/status", "Not enough space for update");
            }
        }
    }else{
        Serial.println("HTTP error" + String(responseCode));
        if(Firebase.ready()){
            Firebase.RTDB.setString(&fbdo, "/Firmware/status", "HTTP error: " + String(responseCode));
        }
    }
    otaInProgress = false;
}