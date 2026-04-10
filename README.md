# Market Adda 🛒 | Full-Stack Vendor Management System

**Market Adda** is a professional management portal designed to digitize and secure the storage operations of local market vendors. It replaces manual paper ledgers with a robust digital ecosystem, featuring real-time inventory tracking, automated WhatsApp receipts, and financial reporting.

---

## 🚀 Key Features

* **Secure Authentication:** Branded login portal for authorized personnel.
* **Live Storage Dashboard:** Real-time monitoring of cart inventory using React state synchronization.
* **Digital Receipting:** Integration with **WhatsApp API** for paperless vendor confirmations.
* **Financial Reporting:** Automated "Grand Total" calculations and **PDF exports** using jsPDF.
* **Safety Compliance:** Dedicated module for prohibited items and facility safety rules.
* **Optimized Backend:** Managed server lifecycle with **ServletContextListeners** to prevent memory leaks.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Bootstrap 5, GSAP (Animations), jsPDF.
* **Backend:** Java (Jakarta EE), Servlets, JDBC, Google Gson.
* **Database:** MySQL 8.0.
* **Server:** Apache Tomcat 10.1.

---

### SQL table
CREATE DATABASE reactproject;
USE reactproject;

CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    token INT NOT NULL UNIQUE,
    phonenumber BIGINT NOT NULL,
    items TEXT,
    amount_paid INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Stored',
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
🔄 ** Data Pipeline (JSON Management)**
* The project utilizes a Bi-Directional JSON Pipeline to bridge the gap between Java and JavaScript.

* Serialization: On the backend, Google GSON transforms Java Objects into JSON strings for the browser.

* Consumption: The React Fetch API parses the JSON stream into a JavaScript array for the UI.

* Deserialization: Frontend JSON payloads are sent via POST, captured by a BufferedReader in Java, and converted back into Java Objects for DB insertion.

### 🛠️ Setup & Installation
### Backend Setup
* Import project into Eclipse IDE as a Dynamic Web Project.

* Add mysql-connector-j.jar and gson.jar to your build path.

* Configure your MySQL credentials in VendorServlet.java.

* Run on Apache Tomcat 10.1.

### Frontend Setup
* Navigate to /frontend.

* Install dependencies: npm install.

* Run development server: npm run dev.

* Point API_URL in App.jsx to your local Tomcat instance.

### 👤 Author
Yashaswini Mudragadda Frontend Developer & Java Enthusiast Specializing in Modern UI/UX and RESTful Architectures.
);


## 📂 Project Structure

```text
MarketAdda/
├── frontend/ (React.js)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewEntry.jsx
│   │   │   ├── LiveStorage.jsx
│   │   │   ├── DailyReports.jsx
│   │   │   └── SafetyRules.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── backend/ (Java Servlet API)
│   ├── src/main/java/com/example/
│   │   ├── controller/
│   │   │   ├── VendorServlet.java       (API Endpoints)
│   │   │   └── MyAppContextListener.java (Lifecycle Management)
│   │   └── model/
│   │       └── Vendor.java              (Data Model/POJO)
│   └── webapp/WEB-INF/lib/              (MySQL Connector, Gson jars)
└── README.md



-- Example Insert
INSERT INTO vendors (name, token, phonenumber, items, amount_paid)
VALUES ('Sample Vendor', 101, 9876543210, 'Fruit Cart', 50);
