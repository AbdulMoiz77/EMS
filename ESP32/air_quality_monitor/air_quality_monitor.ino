#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "time.h"

#include "secrets.h"

DHT dht(13, DHT11);

struct SensorData {
  float temperature;
  float humidity;
};

const long  gmtOffset_sec = 18000;

void setup() {
  Serial.begin(921600);
  connectWifi();
  dht.begin();
  delay(2000);
  configTime(gmtOffset_sec, 0, "pool.ntp.org", "time.nist.gov");
}

void loop() {

  if(WiFi.status() != WL_CONNECTED){
    connectWifi();
  }

  SensorData readings = getReadings();
  Serial.println("Temperature " + String(readings.temperature));
  Serial.println("Humidity " + String(readings.humidity));

  struct tm timeinfo;
  String formattedTime = "";
  if (getLocalTime(&timeinfo)) {
    char time[30];
    strftime(time, sizeof(time), "%Y-%m-%d %H:%M:%S", &timeinfo);
    formattedTime = String(time);
  }

  delay(1000);

  RequestAgain:
  HTTPClient http;
  http.begin(URL);
  http.addHeader("Content-Type","application/json");

  String Data =  "{\"timestamp\":\"" + formattedTime + "\",\"temperature\":" + String(readings.temperature) + ",\"humidity\":" + String(readings.humidity) + "}";

  int responseCode = http.POST(Data);

  String payload = http.getString();

  if(responseCode == -1){
    Serial.println("Request Failed. Trying Again...");
    goto RequestAgain;
  }

  Serial.println("URL: "+ URL);
  Serial.println("Data: "+ Data);
  Serial.println("HttpCode: "+ String(responseCode));
  Serial.println("Payload: " + payload);
  delay(500);
}

void connectWifi(){
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println('Connecting...');

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
}

SensorData getReadings(){
  float temperature_arr[10];
  float humidity_arr[10];

  SensorData logs;
  float temperature = 0;
  float humidity = 0;

  int size = sizeof(temperature_arr) / sizeof(temperature_arr[0]);

  for(int i=0; i < size ; i++){
    temperature_arr[i] = dht.readTemperature();
    humidity_arr[i] = dht.readHumidity();
    temperature += temperature_arr[i];
    humidity += humidity_arr[i];
    delay(30000);
  }

  logs.temperature = temperature/10;
  logs.humidity = humidity/10;
  return logs;
}