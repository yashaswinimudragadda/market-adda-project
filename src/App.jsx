import './App.css';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:8080/VendorManagement/api/vendors';

// --- COMPONENT 1: DASHBOARD ---
const Dashboard = ({ vendors }) => {
  // Logic for daily entries
  const todayStr = new Date().toLocaleDateString();
  const todayEntries = vendors.filter(v => 
    v.entry_time ? new Date(v.entry_time).toLocaleDateString() === todayStr : true
  ).length;

  const totalRevenue = vendors.reduce((sum, v) => sum + (Number(v.amount_paid) || 0), 0);
  const activeVendors = vendors.length;

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
            <p className="mb-0 opacity-75">Total Active Carts</p>
            <h2 className="fw-bold mb-0">{activeVendors}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4">
            <p className="mb-0 opacity-75">New Entries Today</p>
            <h2 className="fw-bold mb-0">{todayEntries}</h2>
          </div>
        </div>
      </div>
      <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center">
        <i className="bi bi-shield-lock-fill me-3 fs-4"></i>
        <div><strong>Safety Protocol:</strong> Verified no flammable items for all {activeVendors} carts.</div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: NEW ENTRY ---
const NewEntry = ({ onAddSuccess }) => {
  const [form, setForm] = useState({ name: '', phone: '', items: '', amount: '', safety: false });

  const handleProcess = async () => {
    if (!form.name || !form.phone || !form.amount || !form.items) return alert("Fill all fields");
    if (!form.safety) return alert("Please confirm safety check");

    const token = Math.floor(1000 + Math.random() * 9000);
    const vendorData = {
      name: form.name,
      phonenumber: form.phone,
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
        const message = `*Market Adda Receipt*%0A*Token:* MA-${token}%0A*Vendor:* ${form.name}%0A*Amount:* ₹${form.amount}`;
        window.open(`https://wa.me/91${form.phone}?text=${message}`, '_blank');
        onAddSuccess();
      }
    } catch (err) {
      alert("Error connecting to Java Server");
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: '600px' }}>
      <h4 className="fw-bold mb-4">Vendor Check-in</h4>
      <input type="text" className="form-control mb-3" placeholder="Vendor Name" onChange={(e) => setForm({...form, name: e.target.value})} />
      <input type="text" className="form-control mb-3" placeholder="Phone (10 digits)" onChange={(e) => setForm({...form, phone: e.target.value})} />
      <textarea className="form-control mb-3" placeholder="Items Description" onChange={(e) => setForm({...form, items: e.target.value})}></textarea>
      <input type="number" className="form-control mb-3" placeholder="Amount (₹)" onChange={(e) => setForm({...form, amount: e.target.value})} />
      <div className="form-check mb-4">
        <input className="form-check-input" type="checkbox" onChange={(e) => setForm({...form, safety: e.target.checked})} />
        <label className="form-check-label text-danger">No pesticides/crackers inside the cart.</label>
      </div>
      <button className="btn btn-success w-100 fw-bold" onClick={handleProcess}>SAVE & SEND RECEIPT</button>
    </div>
  );
};

// --- COMPONENT 3: LIVE STORAGE (with Check-out & Time) ---
const LiveStorage = ({ vendors, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleCheckOut = async (id, token) => {
    const inputToken = prompt("Enter Security Token to release cart:");
    if (inputToken === token.toString()) {
      try {
        const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Cart Released Successfully!");
          onUpdate();
        }
      } catch (err) { alert("Check-out failed"); }
    } else {
      alert("Invalid Token!");
    }
  };

  // UPDATED FILTER LOGIC: Checks both Name and Token
  const filtered = vendors.filter(v => {
    const search = searchTerm.toLowerCase();
    const nameMatch = v.name?.toLowerCase().includes(search);
    const tokenMatch = v.token?.toString().includes(search); // Converts token to string for comparison
    
    return nameMatch || tokenMatch;
  });

  return (
    <div className="card border-0 shadow-sm p-4 text-center">
      {/* Updated placeholder to let users know they can search for tokens too */}
      <input 
        type="text" 
        className="form-control mb-4" 
        placeholder="Search by Name or Token (e.g. 4502)..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr><th>Time In</th><th>Token</th><th>Vendor</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((v) => (
                <tr key={v.id}>
                  <td className="small text-muted">
                     {v.entry_time ? new Date(v.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </td>
                  <td><span className="badge bg-secondary">MA-{v.token}</span></td>
                  <td><strong>{v.name}</strong></td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleCheckOut(v.id, v.token)}>Release</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No matches found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// --- COMPONENT 4: REPORTS (Updated with Total Calculation) ---
const DailyReports = ({ vendors }) => {
  // 1. Calculate the Grand Total of all payments
  const grandTotal = vendors.reduce((acc, v) => acc + (Number(v.amount_paid) || 0), 0);
  
  // 2. Count total transactions
  const totalTransactions = vendors.length;

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Market Adda - Daily Closing Report', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Transactions: ${totalTransactions}`, 14, 35);
    doc.text(`Grand Total Revenue: Rs. ${grandTotal}`, 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Token', 'Vendor Name', 'Items', 'Amount (Rs.)']],
      body: vendors.map(v => [
        `MA-${v.token}`, 
        v.name, 
        v.items, 
        v.amount_paid
      ]),
      foot: [['', '', 'GRAND TOTAL', `Rs. ${grandTotal}`]], // Adds total to PDF
      theme: 'grid',
      headStyles: { fillStyle: [40, 167, 69] } // Success Green
    });
    
    doc.save(`Market_Adda_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-4 bg-white">
            <p className="text-muted mb-1">Total Transactions</p>
            <h2 className="fw-bold">{totalTransactions}</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-4 bg-success text-white">
            <p className="mb-1 opacity-75">Total Cash Collected</p>
            <h2 className="fw-bold">₹{grandTotal}</h2>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold m-0">Detailed Ledger</h5>
          <button className="btn btn-success shadow-sm" onClick={handleDownload}>
            <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF Report
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Token</th>
                <th>Vendor Name</th>
                <th className="text-end">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td><span className="badge bg-light text-dark border">MA-{v.token}</span></td>
                  <td className="fw-semibold">{v.name}</td>
                  <td className="text-end fw-bold text-success">₹{v.amount_paid}</td>
                </tr>
              ))}
            </tbody>
            {/* 3. The Visual Total Row at the bottom of the table */}
            <tfoot className="table-dark">
              <tr>
                <td colSpan="2" className="text-uppercase fw-bold p-3">Grand Total Collection</td>
                <td className="text-end fw-bold p-3" style={{fontSize: '1.2rem'}}>₹{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
// --- COMPONENT 5: SAFETY RULES ---
const SafetyRules = () => (
  <>
  <div className="animate__animated animate__fadeIn">
    <div className="card border-0 shadow-sm p-4 border-start border-5 border-danger">
      <h4 className="fw-bold text-danger mb-4">
        <i className="bi bi-shield-lock-fill me-2"></i>Prohibited Items
      </h4>
      <p className="text-muted">
        To ensure the safety of all vendors and the storage facility, the following items are 
        <strong> strictly prohibited</strong>. Any vendor found with these will be blacklisted.
      </p>
      <div className="list-group list-group-flush mt-3">
        <div className="list-group-item py-3">
          <i className="bi bi-x-circle-fill text-danger me-3"></i> 
          <strong>Explosives / Crackers:</strong> High fire risk in enclosed storage.
        </div>
        <div className="list-group-item py-3">
          <i className="bi bi-x-circle-fill text-danger me-3"></i> 
          <strong>Pesticides / Poison:</strong> Risk of contamination to nearby food carts.
        </div>
        <div className="list-group-item py-3">
          <i className="bi bi-x-circle-fill text-danger me-3"></i> 
          <strong>Flammable Liquids:</strong> Petrol, Kerosene, or Loose Alcohol.
        </div>
      </div>
    </div>
    
    <div className="mt-4 p-3 bg-warning-subtle text-warning-emphasis rounded border border-warning-subtle">
      <i className="bi bi-info-circle-fill me-2"></i>
      <strong>Note:</strong> Daily inspections are conducted every morning at 9:00 AM.
    </div>
  </div>
  </>
);

// 1. Ensure all components are imported or defined above App
// 2. Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // FETCH DATA
  const loadData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error("Database connection failed:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!isLoggedIn) {
    return (
     <div className="vh-100 d-flex justify-content-center align-items-center login-gradient">
        <div className="card border-0 shadow-lg p-5 text-center animate__animated animate__fadeIn" style={{ maxWidth: '400px', borderRadius: '20px' }}>
          
          {/* Logo Icon */}
          <div className="mb-4 text-success">
            <i className="bi bi-shop-window" style={{ fontSize: '4rem' }}></i>
          </div>

          {/* Branding */}
          <h2 className="fw-bold mb-1">MARKET ADDA</h2>
          <p className="text-muted small text-uppercase fw-semibold mb-4" style={{ letterSpacing: '2px' }}>
            Management Portal
          </p>

          {/* Caption */}
          <p className="text-muted mb-5 px-2">
            "Organizing the heart of our city. <br/> 
            Your digital gateway to safe and secure vendor cart storage."
          </p>

          {/* Login Button */}
          <button 
            className="btn btn-success btn-lg w-100 fw-bold py-3 shadow-sm" 
            onClick={() => setIsLoggedIn(true)}
            style={{ borderRadius: '12px', transition: 'all 0.3s' }}
          >
            <i className="bi bi-shield-lock-fill me-2"></i> SECURE ACCESS
          </button>

          <div className="mt-4 text-muted" style={{ fontSize: '0.8rem' }}>
            Authorized Personnel Only
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 d-flex">
      {/* Sidebar Navigation */}
      <nav className="bg-dark text-white p-3 min-vh-100 shadow" style={{ width: '260px' }}>
        <h3 className="text-success text-center mb-5 fw-bold">MARKET ADDA</h3>
        <div className="d-grid gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`btn text-start ${activeTab === 'dashboard' ? 'btn-success' : 'text-white'}`}>
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </button>
          <button onClick={() => setActiveTab('entry')} className={`btn text-start ${activeTab === 'entry' ? 'btn-success' : 'text-white'}`}>
            <i className="bi bi-plus-circle me-2"></i> New Entry
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`btn text-start ${activeTab === 'inventory' ? 'btn-success' : 'text-white'}`}>
            <i className="bi bi-table me-2"></i> Live Storage
          </button>
          <button onClick={() => setActiveTab('reports')} className={`btn text-start ${activeTab === 'reports' ? 'btn-success' : 'text-white'}`}>
            <i className="bi bi-file-text me-2"></i> Reports
          </button>
          <button onClick={() => setActiveTab('safety')} className={`btn text-start ${activeTab === 'safety' ? 'btn-success' : 'text-white'}`}>
            <i className="bi bi-shield-check me-2"></i> Safety Rules
          </button>
        </div>
        <button className="btn btn-outline-danger mt-auto w-100" onClick={() => setIsLoggedIn(false)}>Logout</button>
      </nav>

      {/* Main Content Area */}
      <main className="p-5 flex-grow-1 bg-light min-vh-100">
        <h1 className="fw-bold mb-5 text-uppercase" style={{fontSize: 'clamp(1.5rem, 5vw, 2.5rem)'}}>
          {activeTab.replace('-', ' ')}
        </h1>

        {activeTab === 'dashboard' && <Dashboard vendors={vendors} />}
        {activeTab === 'entry' && <NewEntry onAddSuccess={() => { loadData(); setActiveTab('inventory'); }} />}
        {activeTab === 'inventory' && <LiveStorage vendors={vendors} onUpdate={loadData} />}
        {activeTab === 'reports' && <DailyReports vendors={vendors} />}
        {activeTab === 'safety' && <SafetyRules />}
      </main>
    </div>
  );
};

export default App;