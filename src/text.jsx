import './App.css';
import React, { useState } from 'react';
import storageData from './data.json';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- COMPONENT 1: DASHBOARD ---
const Dashboard = ({ vendors }) => {
  const totalRevenue = vendors.reduce((sum, v) => sum + (Number(v.amountPaid) || 0), 0);
  const activeVendors = vendors.length;
  const availableSpace = activeVendors < 20 ? 'High' : 'Low';

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-success text-white p-4">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-0 opacity-75">Today's Revenue</p>
                <h2 className="fw-bold mb-0">₹{totalRevenue}</h2>
              </div>
              <i className="bi bi-currency-rupee fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white p-4">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-0 opacity-75">Active Vendors</p>
                <h2 className="fw-bold mb-0">{activeVendors}</h2>
              </div>
              <i className="bi bi-people fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-0 opacity-75">Available Space</p>
                <h2 className="fw-bold mb-0">{availableSpace}</h2>
              </div>
              <i className="bi bi-box-seam fs-1 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center">
        <i className="bi bi-exclamation-octagon-fill me-3 fs-4"></i>
        <div>
          <strong>Safety Alert:</strong> Ensure all vendors have declared no pesticides or crackers today.
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: NEW ENTRY (Updated with Logic) ---
const NewEntry = ({ onAddVendor }) => {
  const [form, setForm] = useState({ name: '', phone: '', items: '', amount: '', safety: false });

  const handleProcess = () => {
    if (!form.name || !form.phone || !form.amount || !form.items) return alert("Fill all fields");
    if (!form.safety) return alert("Confirm safety check");

    const token = Math.floor(1000 + Math.random() * 9000).toString(); // Unique 4-digit token
    
    // Create new vendor object matching your JSON structure
    const newVendor = {
      id: `V-${Date.now()}`,
      token: token,
      name: form.name,
      phone: form.phone,
      inventory: { item: form.items, quantity: "1 Unit" },
      status: "Stored",
      amountPaid: Number(form.amount)
    };

    // WhatsApp logic
    const message = `*Market Adda Receipt*%0A*Token:* MA-${token}%0A*Vendor:* ${form.name}%0A*Payment:* ₹${form.amount} (Paid)`;
    window.open(`https://wa.me/${form.phone}?text=${message}`, '_blank');

    onAddVendor(newVendor);
    alert("Entry Added Successfully!");
  };

  return (
    <div className="card border-0 shadow-sm p-4 mx-auto" style={{ maxWidth: '700px' }}>
      <h4 className="fw-bold mb-4 text-success"><i className="bi bi-person-plus-fill me-2"></i>Vendor Check-in</h4>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Vendor Name</label>
          <input type="text" className="form-control" placeholder="Ex: Ramu" onChange={(e) => setForm({...form, name: e.target.value})} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Phone Number</label>
          <input type="text" className="form-control" placeholder="91xxxxxxxx" onChange={(e) => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Items Description</label>
          <textarea className="form-control" rows="2" placeholder="Ex: 2 Baskets" onChange={(e) => setForm({...form, items: e.target.value})}></textarea>
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Payment Amount (₹)</label>
          <input type="number" className="form-control" placeholder="Amount Paid" onChange={(e) => setForm({...form, amount: e.target.value})} />
        </div>
        <div className="col-12">
          <div className="p-3 bg-light rounded border border-danger-subtle">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="safetyCheck" onChange={(e) => setForm({...form, safety: e.target.checked})} />
              <label className="form-check-label text-danger fw-bold" htmlFor="safetyCheck">Confirm NO illegal items (Crackers/Pesticides).</label>
            </div>
          </div>
        </div>
        <div className="col-12 mt-4">
          <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={handleProcess}>
            GENERATE TOKEN & SEND WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
};
const LiveStorage = ({ vendors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleCheckOut = (vendorName, correctToken) => {
    const enteredToken = prompt(`Enter Security Token for ${vendorName}:`);
    
    // Convert both to strings to ensure the comparison works 100%
    if (enteredToken === correctToken.toString()) {
       alert("Verification Successful! Items can be released.");
    } else {
       alert("Wrong Token! Access Denied.");
    }
  };

  // Improved Filter Logic
  const filtered = vendors.filter(v => {
    const search = searchTerm.toLowerCase();
    
    // Safely convert values to strings
    const nameStr = (v.name || "").toLowerCase();
    const tokenStr = (v.token || "").toString();

    return nameStr.includes(search) || tokenStr.includes(search);
  });

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <h4 className="fw-bold text-primary mb-0">Current Inventory</h4>
        <input 
          type="text" 
          className="form-control w-50" 
          placeholder="Search Name or Token (e.g. 4502)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>Token</th>
              <th>Vendor</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((v, i) => (
                <tr key={v.id || i}>
                  <td><span className="badge bg-secondary">MA-{v.token}</span></td>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.inventory?.item || "N/A"}</td>
                  <td><span className="badge bg-success-subtle text-success">{v.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleCheckOut(v.name, v.token)}>
                      Check-out
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
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
// --- COMPONENT 4: REPORTS ---
const DailyReports = ({ vendors }) => {
  const totalRevenue = vendors.reduce((acc, v) => acc + (Number(v.amountPaid) || 0), 0);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text('Market Adda - Daily Report', 20, 20);
    autoTable(doc, {
      head: [['ID', 'Name', 'Item', 'Amount']],
      body: vendors.map(v => [v.id, v.name, v.inventory.item, `₹${v.amountPaid}`]),
      startY: 30,
    });
    doc.save(`Report_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="row g-4 mb-4">
        <div className="col-md-6"><div className="card p-4"><h6>Transactions</h6><h2>{vendors.length}</h2></div></div>
        <div className="col-md-6"><div className="card p-4 bg-success text-white"><h6>Collection</h6><h2>₹{totalRevenue}</h2></div></div>
      </div>
      <div className="card p-4">
        <div className="d-flex justify-content-between mb-3">
          <h5>Closing Ledger</h5>
          <button className="btn btn-sm btn-outline-success" onClick={handleDownload}>Download PDF</button>
        </div>
        <table className="table table-sm">
          <thead><tr><th>Vendor</th><th className="text-end">Amount</th></tr></thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}><td>{v.name}</td><td className="text-end fw-bold">₹{v.amountPaid}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- COMPONENT 5: SAFETY RULES ---
const SafetyRules = () => (
  <div className="card border-0 shadow-sm p-4 border-start border-5 border-danger">
    <h4 className="fw-bold text-danger mb-4"><i className="bi bi-shield-lock-fill me-2"></i>Prohibited Items</h4>
    <div className="list-group list-group-flush">
      <div className="list-group-item"><i className="bi bi-x-circle-fill text-danger me-2"></i> Explosives / Crackers</div>
      <div className="list-group-item"><i className="bi bi-x-circle-fill text-danger me-2"></i> Pesticides / Poison</div>
    </div>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use state for vendors so the list updates when we add new ones
  const [vendors, setVendors] = useState(storageData.storageData);

  const addVendor = (newVendor) => {
    setVendors([newVendor, ...vendors]); // Adds new vendor to the top of the list
    setActiveTab('inventory'); // Automatically switch to inventory to see the new entry
  };

  const handleCheckOut = (token) => {
    setVendors(vendors.filter((v) => v.token.toString() !== token.toString()));
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <nav className="col-md-2 bg-dark min-vh-100 p-3 sticky-top shadow">
          <div className="text-center mb-5 mt-2">
            <h3 className="text-success fw-bold">MARKET ADDA</h3>
            <span className="badge bg-secondary small">ADMIN v1.0</span>
          </div>
          <div className="d-grid gap-2">
            <MenuBtn icon="speedometer2" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <MenuBtn icon="plus-circle" label="New Entry" active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} />
            <MenuBtn icon="table" label="Live Storage" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <MenuBtn icon="file-text" label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <MenuBtn icon="shield-check" label="Safety Rules" active={activeTab === 'safety'} onClick={() => setActiveTab('safety')} />
          </div>
        </nav>

        <main className="col-md-10 p-5 bg-light min-vh-100">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h1 className="fw-bold text-capitalize">{activeTab}</h1>
            <div className="text-end">
              <p className="text-muted small mb-0 fw-bold">DATE</p>
              <p className="fw-bold">{new Date().toDateString()}</p>
            </div>
          </div>

          {activeTab === 'dashboard' && <Dashboard vendors={vendors} />}
          {activeTab === 'entry' && <NewEntry onAddVendor={addVendor} />}
          {activeTab === 'inventory' && <LiveStorage vendors={vendors} onCheckOut={handleCheckOut} />}
          {activeTab === 'reports' && <DailyReports vendors={vendors} />}
          {activeTab === 'safety' && <SafetyRules />}
        </main>
      </div>
    </div>
  );
};

const MenuBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`btn text-start border-0 py-3 px-4 rounded-3 ${active ? 'btn-success shadow' : 'btn-dark text-secondary'}`}>
    <i className={`bi bi-${icon} me-3`}></i> {label}
  </button>
);

export default App;