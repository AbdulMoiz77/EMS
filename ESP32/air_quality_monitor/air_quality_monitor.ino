#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <DHT.h>
#include <Update.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "time.h"
#include "secrets.h"
#include "OTAUpdate.h"

FirebaseData fbdo;
FirebaseData fbdoStream;

FirebaseAuth auth;
FirebaseConfig config;

DHT dht(13, DHT11);

unsigned long int sendDataPrevMillis = 0;
String url = "";
bool signupOK = false, update, otaInProgress = false;
float Temperature, Humidity;
const long  gmtOffset_sec = 18000;

void setup()
{
    Serial.begin(921600);
    dht.begin();
    delay(200);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }

    Serial.println("\nConnected to WiFi");

    configTime(gmtOffset_sec, 0, "pool.ntp.org", "time.nist.gov");

    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    if(Firebase.signUp(&config, &auth,"","")){
        Serial.println("Signed Up");
        signupOK = true;
    }else{
        Serial.println(config.signer.signupError.message.c_str());
    }

    config.token_status_callback = tokenStatusCallback;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    setupStream();
}

void loop()
{
    if(!otaInProgress && Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 300000 || sendDataPrevMillis == 0)){
        sendDataPrevMillis = millis();
        Temperature  = dht.readTemperature();
        Humidity = dht.readHumidity();
        pushData();
    }
}

void pushData(){
    struct tm timeinfo;
    String formattedTime = "";
    if (getLocalTime(&timeinfo)) {
        char time[30];
        strftime(time, sizeof(time), "%Y-%m-%dT%H:%M:%S", &timeinfo);
        formattedTime = String(time);
    }
    
    Serial.println("Timestamp: " + formattedTime);
    String node = "Sensor/" + formattedTime;

    resendTemperature:
    if(Firebase.RTDB.setFloat(&fbdo, node + "/Temperature", Temperature)){
        Serial.println();
        Serial.println("Temperature: " + String(Temperature));
        Serial.print("- successfully saved to " + fbdo.dataPath());
        Serial.println( "(" + fbdo.dataType() + ") " );
    }else{
        Serial.println("Failed: " + fbdo.errorReason());
        goto resendTemperature;
    }

    resendHumidity:
    if(Firebase.RTDB.setFloat(&fbdo, node + "/Humidity", Humidity)){
        Serial.println();
        Serial.println("Humidity: " + String(Humidity));
        Serial.print("- successfully saved to " + fbdo.dataPath());
        Serial.println( "(" + fbdo.dataType() + ") " );
    }else{
        Serial.println("Failed: " + fbdo.errorReason());
        goto resendHumidity;
    }
}