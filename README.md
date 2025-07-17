# test-k6-automation
# k6 insattation
sudo apt update
sudo apt install gnupg ca-certificates
curl -fsSL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list > /dev/null
sudo apt update
sudo apt install k6

# InfluxDB v1 Installation 
wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -
echo "deb https://repos.influxdata.com/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt update && sudo apt install influxdb

# start influxdb
sudo systemctl start influxdb
sudo systemctl enable influxdb


# Database Setup

influx
> CREATE DATABASE k6
> SHOW DATABASES
> exit

# Add InfluxDB Data Source:
URL: http://localhost:8086
Database: k6

# Grafana Installation

sudo apt install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt update
sudo apt install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access Grafana at:
➡️ http://localhost:3000
➡️ Default credentials: admin / admin


# Run get_patient_test.js

k6 run --out influxdb=http://localhost:8086/k6 get_patient_test.js

# Run test_stress.js
k6 run --out influxdb=http://localhost:8086/k6 stress_test.js

# Run test_soak.js
k6 run --out influxdb=http://localhost:8086/k6 soak_test.js



