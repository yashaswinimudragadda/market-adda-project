# 🛒 Market Adda

**Market Adda** is a full-stack digital management portal designed to revolutionize how market storage units and street vendor operations are managed. By replacing traditional paper-based logging with a secure, real-time digital system, it ensures transparency and efficiency for both vendors and market administrators.

---

## 🌟 Key Features

- **Digital Vendor Check-in:** Streamlined registration for vendors entering storage facilities.
- **WhatsApp Integration:** Automatic delivery of digital receipts and tokens directly to the vendor's phone.
- **Secure Token System:** A unique token-based check-out process to ensure inventory security.
- **Real-time Dashboard:** Monitor daily revenue, active inventory, and storage occupancy at a glance.
- **Financial Reporting:** Generate automated daily/monthly financial summaries in PDF format for audit and tracking.
- **Safety Protocols:** Built-in validation to prevent the storage of prohibited items.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS (or HeroUI/Bootstrap)
- **Backend:** Java (Servlets & JDBC), MVC Architecture
- **Database:** MySQL
- **APIs:** WhatsApp Business API integration for notifications
- **Reporting:** iText / JasperReports for PDF generation

---

## 📂 Project Structure

```text
market-adda-project/
├── frontend/                # React.js Application
│   ├── src/
│   │   ├── components/      # Reusable UI (Forms, Tables, Cards)
│   │   ├── pages/           # Dashboard, Check-in, Reports
│   │   └── context/         # State management
├── backend/                 # Java Web Application
│   ├── src/main/java/
│   │   ├── controller/      # Servlets handling requests
│   │   ├── dao/             # Data Access Objects (MySQL Logic)
│   │   └── model/           # Data Blueprints (Vendor, Token, User)
│   └── webapp/              # JSP files and configuration
└── database/                # SQL Schema and migration scripts


git clone [https://github.com/yashaswinimudragadda/market-adda-project.git](https://github.com/yashaswinimudragadda/market-adda-project.git)
