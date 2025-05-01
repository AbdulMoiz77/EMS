import { database } from './firebase/config';
import { ref, onValue } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import "./App.css"
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Thermostat, WaterDrop, Air, AccessTime } from '@mui/icons-material';

type SensorData = {
  Timestamp: string;
  Temperature: number;
  Humidity: number;
};

function App() {
  const now = moment();
  const isSunrise = now.isBetween(moment().hour(5).minute(26), moment().hour(6).minute(26));
  const isSunset = now.isBetween(moment().hour(18).minute(32), moment().hour(19).minute(32));
  const isDay = now.isBetween(moment().hour(6).minute(26), moment().hour(18).minute(32));

  let backgroundClass = '';
  if (isSunrise) {
    backgroundClass = 'sunrise-background';
  } else if (isSunset) {
    backgroundClass = 'sunset-background';
  } else if (isDay) {
    backgroundClass = 'day-background';
  } else {
    backgroundClass = 'night-background';
  }

  const [data, setData] = useState<SensorData[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(moment().format('YYYY-MM-DD HH:mm:ss'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const sensorRef = ref(database, 'Sensor/');
    onValue(sensorRef, (snapshot) => {
      const rawData = snapshot.val();
      if (rawData) {
        const parsedData = Object.keys(rawData).map((key) => ({
          Timestamp: key,
          Temperature: rawData[key].Temperature,
          Humidity: rawData[key].Humidity,
        }));
        setData(parsedData);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // const now = moment();
  const last24HoursData = data.filter((d) =>
    moment(d.Timestamp).isAfter(now.clone().subtract(24, 'hours'))
  );

  const latest = last24HoursData.length > 0 ? last24HoursData[last24HoursData.length - 1] : null;

  const getSummary = (key: keyof SensorData) => {
    const values = last24HoursData.map((d) => Number(d[key])).filter((v) => !isNaN(v));
    if (values.length === 0) {
      return { avg: '0', min: '0', max: '0' };
    }
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    return { avg, min, max };
  };

  const getAirQualityStatus = (temp: number, humidity: number) => { 
    if (temp >= 18 && temp <= 26 && humidity >= 30 && humidity <= 60) {
      return { status: 'Good', color: '#66CC66', text: "#006400"}; // Green
    }
  
    if (
      ((temp >= 20 && temp <= 30) || (temp >= 27 && temp <= 32)) &&
      humidity >= 30 && humidity <= 70
    ) {
      return { status: 'Moderate', color: '#FFEB99', text: "#FFC300"}; // Yellow
    }
  
    if (temp > 32 || temp < 20 || humidity > 70 || humidity < 30) {
      return { status: 'Unhealthy', color: '#ffc067', text: "#f57c00"}; // Orange
    }

    if (temp > 40 && humidity > 80) {
      return { status: 'Very Unhealthy', color: '#FFEAD0', text: "#8B0000"};  // Dark red
    }
  };
  
  

  const tempSummary = getSummary('Temperature');
  const humiditySummary = getSummary('Humidity');
  const airStatus = latest ? getAirQualityStatus(Number(latest.Temperature), Number(latest.Humidity)) : null;

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading data...
        </Typography>
      </Container>
    );
  }

  return (
    <div className ={backgroundClass}>
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: "#ffffff"}}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2, color: "#ffffff"}}>
          Air Quality Dashboard
        </Typography>
        <Chip
          icon={<AccessTime />}
          label={currentTime}
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 'bold', color: "#ffffff" }}
        />
      </Box>

      {latest ? (
        <>
          <Typography variant="h6" gutterBottom sx={{color: "#ffffff"}}>
            Last Updated: {moment(latest.Timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#ffebee', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Thermostat sx={{ verticalAlign: 'middle', color: '#f44336' }} /> Latest Temperature
                  </Typography>
                  <Typography variant="h4" color="error" sx={{ mt: 1 }}>
                    {latest.Temperature} °C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <WaterDrop sx={{ verticalAlign: 'middle', color: '#2196f3' }} /> Latest Humidity
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                    {latest.Humidity} %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: airStatus?.color || '#f5f5f5', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Air sx={{ verticalAlign: 'middle', color: '#2596be' }} /> Air Quality Status
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, color: airStatus?.text }}>
                    {airStatus?.status || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#fff3e0', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Avg Temperature (Last 24 hours)
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{tempSummary.avg} °C</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Min: {tempSummary.min} | Max: {tempSummary.max}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#e8f5e9', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Avg Humidity (Last 24 hours)
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{humiditySummary.avg} %</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Min: {humiditySummary.min} | Max: {humiditySummary.max}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{backdropFilter: 'blur(10px)', border: '2px solid rgb(255, 255, 255,0.2)', borderRadius: 3, boxShadow: 3, my: 4, pt: 5, pr:5}}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last24HoursData}>
              <CartesianGrid stroke="#ffffff" />
              <XAxis dataKey="Timestamp" tickFormatter={(t) => moment(t).format('HH:mm')} tick={{fill: "#ffffff"}} />
              <YAxis tick={{fill: "#ffffff"}}/>
              <Tooltip labelFormatter={(label) => moment(label).format('YYYY-MM-DD HH:mm:ss')} contentStyle = {{backgroundColor: "#000000", color: "#ffffff", border: "none", borderRadius: '10px'}} />
              <Legend/>
              <Line type="monotone" dataKey="Temperature" stroke="#9EE493"/>
              <Line type="monotone" dataKey="Humidity" stroke="#BCE7FD" />
            </LineChart>
          </ResponsiveContainer>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, color: "#ffffff" }}>
            Raw Logs (Last 24 hours)
          </Typography>

          <TableContainer component={Paper}  sx={{backgroundColor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{color: "#ffffff"}}>Timestamp</TableCell>
                  <TableCell sx={{color: "#ffffff"}}>Temperature (°C)</TableCell>
                  <TableCell sx={{color: "#ffffff"}}>Humidity (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {last24HoursData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{color: "#ffffff"}}>{moment(row.Timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                    <TableCell sx={{color: "#ffffff"}}>{row.Temperature}</TableCell>
                    <TableCell sx={{color: "#ffffff"}}>{row.Humidity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="h6" sx={{ mt: 4 }}>
          No data available for the last 24 hours.
        </Typography>
      )}
    </Container>
    </div>
  );
}

export default App;
