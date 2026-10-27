import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Receipt,
  Truck,
  LifeBuoy,
  Edit,
  Eye,
  TrendingUp,
  Download,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { getStatusBadge } from '../common/Badge';

export const CustomerModule: React.FC = () => {
  const {
    customers,
    transactions,
    waybills,
    tickets,
    addCustomer,
    updateCustomer,
    setSimulatedCallCustomer,
    setInspectedCustomerId,
    setActiveTab,
    globalSearch,
    setActiveReceiptTransaction,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'most_purchased' | 'least_purchased' | 'frequent' | 'recent' | 'active_status' | 'alphabetical'>('most_purchased');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCityState, setFormCityState] = useState('Lagos State');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formSector, setFormSector] = useState('Power Generation & Utilities');
  const [formNotes, setFormNotes] = useState('');

  const effectiveSearch = globalSearch || searchTerm;

  const sortedAndFilteredCustomers = useMemo(() => {
    let list = customers.filter(c => {
      const matchesSearch =
        effectiveSearch === '' ||
        c.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        c.phone.includes(effectiveSearch) ||
        c.id.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        (c.industrySector && c.industrySector.toLowerCase().includes(effectiveSearch.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Apply Sorting
    return list.sort((a, b) => {
      if (sortBy === 'most_purchased') {
        return b.totalSpend - a.totalSpend;
      }
      if (sortBy === 'least_purchased') {
        return a.totalSpend - b.totalSpend;
      }
      if (sortBy === 'frequent') {
        const countA = transactions.filter(t => t.customerId === a.id).length;
        const countB = transactions.filter(t => t.customerId === b.id).length;
        return countB - countA;
      }
      if (sortBy === 'recent') {
        return new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime();
      }
      if (sortBy === 'active_status') {
        if (a.status === b.status) return 0;
        return a.status === 'Active' ? -1 : 1;
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [customers, effectiveSearch, statusFilter, sortBy, transactions]);

  const handleOpenAddModal = (customerToEdit?: Customer) => {
    if (customerToEdit) {
      setEditCustomer(customerToEdit);
      setFormName(customerToEdit.name);
      setFormContact(customerToEdit.contactPerson);
      setFormPhone(customerToEdit.phone);
      setFormEmail(customerToEdit.email);
      setFormAddress(customerToEdit.address);
      setFormCityState(customerToEdit.cityState);
      setFormStatus(customerToEdit.status);
      setFormSector(customerToEdit.industrySector || 'Energy & Utilities');
      setFormNotes(customerToEdit.notes);
    } else {
      setEditCustomer(null);
      setFormName('');
      setFormContact('');
      setFormPhone('+234 ');
      setFormEmail('');
      setFormAddress('');
      setFormCityState('Lagos State');
      setFormStatus('Active');
      setFormSector('Power Generation & Utilities');
      setFormNotes('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Business name and phone number are required.');
      return;
    }

    if (editCustomer) {
      updateCustomer(editCustomer.id, {
        name: formName,
        contactPerson: formContact,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        cityState: formCityState,
        status: formStatus,
        industrySector: formSector,
        notes: formNotes,
      });
    } else {
      addCustomer({
        name: formName,
        contactPerson: formContact,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        cityState: formCityState,
        status: formStatus,
        industrySector: formSector,
        notes: formNotes,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const data = sortedAndFilteredCustomers.map(c => ({
      Customer_ID: c.id,
      BusinessName: c.name,
      Sector: c.industrySector,
      ContactPerson: c.contactPerson,
      Phone: c.phone,
      Email: c.email,
      Address: c.address,
      CityState: c.cityState,
      Status: c.status,
      TotalSpend_NGN: c.totalSpend,
      DateRegistered: c.dateRegistered,
    }));
    exportToCSV(data, 'Cooknow_Oil_Gas_Customer_Directory');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Commercial & Industrial Client Accounts</h2>
          <p className="text-xs text-slate-600">
            Click any Customer ID to inspect its full transaction statement and audit report.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Client</span>
          </button>
        </div>
      </div>

      {/* Sorting & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by client name, ID, phone, sector..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-blue-500 font-medium"
          />
        </div>

        {/* Customer Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort:</span>
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-blue-500"
          >
            <option value="most_purchased">Most Purchased (Highest Spend)</option>
            <option value="least_purchased">Least Purchased (Lowest Spend)</option>
            <option value="frequent">Frequent Buyers (Most Orders)</option>
            <option value="recent">Recent Customers (Newest)</option>
            <option value="active_status">Active / Non-Active Status</option>
            <option value="alphabetical">Alphabetical (A - Z)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-blue-500"
          >
            <option value="all">All Statuses ({customers.length})</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredCustomers.map(cust => {
          const custTransactions = transactions.filter(t => t.customerId === cust.id);
          const custWaybills = waybills.filter(w => w.customerId === cust.id);
          const custTickets = tickets.filter(t => t.customerId === cust.id && t.status !== 'Resolved' && t.status !== 'Closed');

          return (
            <div
              key={cust.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    {/* Clickable Customer Unique ID Button */}
                    <button
                      onClick={() => setInspectedCustomerId(cust.id)}
                      title="Click to view all transactions for this customer"
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{cust.id}</span>
                      <span className="text-[10px] text-blue-600 font-sans font-normal">&rarr; Audit</span>
                    </button>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{cust.name}</h3>
                    <p className="text-xs font-semibold text-blue-700">{cust.industrySector}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{cust.contactPerson}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      cust.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {cust.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {cust.phone}
                    </span>
                    <button
                      onClick={() =>
                        setSimulatedCallCustomer({
                          name: cust.name,
                          phone: cust.phone,
                          context: cust.id,
                        })
                      }
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Simulate Call
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{cust.email}</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span className="line-clamp-1">{cust.address}, {cust.cityState}</span>
                  </div>
                </div>

                {/* Account Metrics Capsule */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Orders</span>
                    <p className="font-bold text-slate-900">{custTransactions.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Waybills</span>
                    <p className="font-bold text-slate-900">{custWaybills.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Open Tickets</span>
                    <p className={`font-bold ${custTickets.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                      {custTickets.length}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Total Recorded Spend:</span>
                  <span className="font-bold text-blue-800 font-mono text-sm">{formatCurrency(cust.totalSpend)}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setInspectedCustomerId(cust.id)}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View All Transactions &rarr;</span>
                </button>
                <button
                  onClick={() => handleOpenAddModal(cust)}
                  className="text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: REGISTER / EDIT CUSTOMER */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editCustomer ? `Edit Client: ${editCustomer.name}` : 'Register Commercial Energy Client'}
        subtitle="Registers industrial power plants, haulage fleets, and filling station networks"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Business / Plant / Company Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="E.g. Sahara Power & Energy Utilities Ltd"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Person / Technical Director
              </label>
              <input
                type="text"
                value={formContact}
                onChange={e => setFormContact(e.target.value)}
                placeholder="Engr. Kolawole Babatunde"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+234 802 000 0000"
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="fuel.dispatch@client.ng"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={formSector}
                onChange={e => setFormSector(e.target.value)}
                placeholder="Power Generation / Heavy Manufacturing"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Terminal / Plant Receiving Address
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={e => setFormAddress(e.target.value)}
              placeholder="Egbin Power Station Complex, Ikorodu"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                City & State
              </label>
              <input
                type="text"
                value={formCityState}
                onChange={e => setFormCityState(e.target.value)}
                placeholder="Lagos State"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-blue-500 font-medium"
              >
                <option value="Active">Active Account</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Account Notes & Tank Farm Specifications
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Bulk tanker offloading gantry, storage tank capacity, discharge pressure..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
            >
              {editCustomer ? 'Update Client Profile' : 'Save Customer Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
