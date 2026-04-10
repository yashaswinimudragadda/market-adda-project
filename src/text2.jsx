import './App.css';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- CONFIGURATION ---
// IMPORTANT: Ensure 'VendorManagement' matches your Eclipse Project Name
const API_URL = 'http://localhost:8080/VendorManagement/api/vendors';

// --- COMPONENT 1: DASHBOARD ---
const Dashboard = ({ vendors }) => {
  // Java uses 'amount', so we use v.amount here
  const totalRevenue = vendors.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const activeVendors = vendors.length;
  const availableSpace = activeVendors < 20 ? 'High' : 'Low';

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-success text-white p-4">
            <p className="mb-0 opacity-75">Today's Revenue</p>
            <h2 className="fw-bold mb-0">₹{totalRevenue}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white p-4">
            <p className="mb-0 opacity-75">Active Vendors</p>
            <h2 className="fw-bold mb-0">{activeVendors}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4">
            <p className="mb-0 opacity-75">Available Space</p>
            <h2 className="fw-bold mb-0">{availableSpace}</h2>
          </div>
        </div>
      </div>
      <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center">
        <i className="bi bi-exclamation-octagon-fill me-3 fs-4"></i>
        <div><strong>Safety Alert:</strong> No pesticides or crackers allowed today.</div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: NEW ENTRY (POST to Java) ---
const NewEntry = ({ onAddSuccess }) => {
  const [form, setForm] = useState({ name: '', phone: '', items: '', amount: '', safety: false });

  const handleProcess = async () => {
    if (!form.name || !form.phone || !form.amount || !form.items) return alert("Fill all fields");
    if (!form.safety) return alert("Confirm safety check");

    const token = Math.floor(1000 + Math.random() * 9000);
    
    // This object matches your Java 'Vendor' class fields
    const vendorData = {
      name: form.name,
      phonenumber: parseInt(form.phone),
      token: token,
      items: form.items,
      amount_paid: parseInt(form.amount)
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });

      if (response.ok) {
        const message = `*Market Adda Receipt*%0A*Token:* MA-${token}%0A*Vendor:* ${form.name}%0A*Payment:* ₹${form.amount}`;
        window.open(`https://wa.me/${form.phone}?text=${message}`, '_blank');
        alert("Entry Saved Successfully!");
        onAddSuccess(); // Reloads the list and switches tab
      } else {
        alert("Server Error! Check Eclipse Console.");
      }
    } catch (err) {
      alert("Connection failed! Is Tomcat running?");
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: '700px' }}>
      <h4 className="fw-bold mb-4 text-success"><i className="bi bi-person-plus-fill me-2"></i>Vendor Check-in</h4>
      <div className="row g-3">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Vendor Name" onChange={(e) => setForm({...form, name: e.target.value})} />
        </div>
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Phone Number" onChange={(e) => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="col-12">
          <textarea className="form-control" placeholder="Items Description" onChange={(e) => setForm({...form, items: e.target.value})}></textarea>
        </div>
        <div className="col-12">
          <input type="number" className="form-control" placeholder="Payment Amount (₹)" onChange={(e) => setForm({...form, amount: e.target.value})} />
        </div>
        <div className="col-12">
          <div className="p-3 bg-light rounded border border-danger-subtle">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" onChange={(e) => setForm({...form, safety: e.target.checked})} />
              <label className="form-check-label text-danger fw-bold">Confirm NO illegal items (Crackers/Pesticides).</label>
            </div>
          </div>
        </div>
        <button className="btn btn-success w-100 fw-bold py-2 shadow-sm mt-3" onClick={handleProcess}>
          GENERATE TOKEN & SEND WHATSAPP
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT 3: LIVE STORAGE ---
const LiveStorage = ({ vendors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = vendors.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.token?.toString().includes(searchTerm)
  );

  return (
    <div className="card border-0 shadow-sm p-4">
      <input type="text" className="form-control mb-4" placeholder="Search Name or Token..." onChange={(e) => setSearchTerm(e.target.value)} />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr><th>Token</th><th>Vendor</th><th>Items</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={i}>
                <td><span className="badge bg-secondary">MA-{v.token}</span></td>
                <td><strong>{v.name}</strong></td>
                <td>{v.items}</td>
                <td><span className="badge bg-success-subtle text-success">{v.status || 'Stored'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- COMPONENT 4: REPORTS ---
const DailyReports = ({ vendors }) => {
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text('Market Adda - Daily Report', 20, 20);
    autoTable(doc, {
      head: [['Token', 'Name', 'Items', 'Amount']],
      body: vendors.map(v => [v.token, v.name, v.items, `₹${v.amount}`]),
    });
    doc.save(`Report_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="card p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5>Closing Ledger</h5>
        <button className="btn btn-sm btn-outline-success" onClick={handleDownload}>Download PDF</button>
      </div>
      <table className="table table-sm">
        <thead><tr><th>Vendor</th><th className="text-end">Amount</th></tr></thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={i}><td>{v.name}</td><td className="text-end fw-bold">₹{v.amount}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);

  // FETCH DATA FROM DATABASE
  const loadData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  // Load data once when app starts
  useEffect(() => {
    loadData();
  }, []);

  const MenuBtn = ({ icon, label, id }) => (
    <button onClick={() => setActiveTab(id)} className={`btn text-start border-0 py-3 px-4 rounded-3 ${activeTab === id ? 'btn-success shadow' : 'btn-dark text-secondary'}`}>
      <i className={`bi bi-${icon} me-3`}></i> {label}
    </button>
  );

  return (
    <div className="container-fluid p-0 d-flex">
      <nav className="bg-dark text-white p-3 min-vh-100 sticky-top shadow" style={{ width: '250px' }}>
        <h3 className="text-success fw-bold text-center mb-5">MARKET ADDA</h3>
        <div className="d-grid gap-2">
          <MenuBtn icon="speedometer2" label="Dashboard" id="dashboard" />
          <MenuBtn icon="plus-circle" label="New Entry" id="entry" />
          <MenuBtn icon="table" label="Live Storage" id="inventory" />
          <MenuBtn icon="file-text" label="Reports" id="reports" />
        </div>
      </nav>

      <main className="p-5 flex-grow-1 bg-light min-vh-100">
        <h1 className="fw-bold text-capitalize mb-5">{activeTab}</h1>
        {activeTab === 'dashboard' && <Dashboard vendors={vendors} />}
        {activeTab === 'entry' && <NewEntry onAddSuccess={() => { loadData(); setActiveTab('inventory'); }} />}
        {activeTab === 'inventory' && <LiveStorage vendors={vendors} />}
        {activeTab === 'reports' && <DailyReports vendors={vendors} />}
      </main>
    </div>
  );
};

export default App;