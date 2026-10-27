import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  History,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Edit,
  TrendingDown,
  TrendingUp,
  Download,
  Eye,
  Layers,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, InventoryCategory, Supplier, StockStatus } from '../../types';
import { formatCurrency, formatDate, exportToCSV, generateRef } from '../../utils/formatters';
import { getStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const InventoryModule: React.FC = () => {
  const {
    inventory,
    suppliers,
    stockMovements,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    addSupplier,
    setInspectedProductLifecycleId,
    globalSearch,
    currentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'suppliers'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formStockRef, setFormStockRef] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('Refined Petroleum Products');
  const [formDescription, setFormDescription] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(33000);
  const [formUnit, setFormUnit] = useState('Litres');
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id || '');
  const [formCostPrice, setFormCostPrice] = useState<number>(1000);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(1150);
  const [formReorderThreshold, setFormReorderThreshold] = useState<number>(33000);
  const [formNotes, setFormNotes] = useState('');
  const [formBatchNo, setFormBatchNo] = useState('');
  const [formDepotLocation, setFormDepotLocation] = useState('Tank Farm Bay 1 - Lekki Terminal');
  const [formError, setFormError] = useState('');

  // Form states for Adjust
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Tank dipping & temperature reconciliation');
  const [adjustError, setAdjustError] = useState('');

  // Form states for Supplier
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supCategory, setSupCategory] = useState('Refinery / Depot Terminal');
  const [supNotes, setSupNotes] = useState('');

  const effectiveSearch = globalSearch || searchTerm;

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch =
        effectiveSearch === '' ||
        item.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.stockRef.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || item.supplierId === supplierFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
    });
  }, [inventory, effectiveSearch, categoryFilter, statusFilter, supplierFilter]);

  const handleOpenAddModal = (itemToEdit?: InventoryItem) => {
    setFormError('');
    if (itemToEdit) {
      setSelectedItem(itemToEdit);
      setFormName(itemToEdit.name);
      setFormStockRef(itemToEdit.stockRef);
      setFormCategory(itemToEdit.category);
      setFormDescription(itemToEdit.description);
      setFormQuantity(itemToEdit.quantity);
      setFormUnit(itemToEdit.unitOfMeasure);
      setFormSupplierId(itemToEdit.supplierId);
      setFormCostPrice(itemToEdit.costPrice);
      setFormSellingPrice(itemToEdit.sellingPrice);
      setFormReorderThreshold(itemToEdit.reorderThreshold);
      setFormNotes(itemToEdit.notes);
      setFormBatchNo(itemToEdit.lifecycle.batchNumber);
      setFormDepotLocation(itemToEdit.lifecycle.depotTankLocation);
    } else {
      setSelectedItem(null);
      setFormName('');
      setFormStockRef(generateRef('CK-OG', 4));
      setFormCategory('Refined Petroleum Products');
      setFormDescription('');
      setFormQuantity(33000);
      setFormUnit('Litres');
      setFormSupplierId(suppliers[0]?.id || '');
      setFormCostPrice(1040);
      setFormSellingPrice(1180);
      setFormReorderThreshold(33000);
      setFormNotes('Density checked, sulfur spec compliant.');
      setFormBatchNo(generateRef('BATCH-OG', 4));
      setFormDepotLocation('Tank Farm Bay 1 - Lekki Terminal');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formStockRef.trim()) {
      setFormError('Product name and stock reference are required.');
      return;
    }
    if (formQuantity < 0) {
      setFormError('Quantity cannot be negative.');
      return;
    }

    const supplier = suppliers.find(s => s.id === formSupplierId);
    const supplierName = supplier?.name || 'Refinery Consignment';

    if (selectedItem) {
      const res = updateInventoryItem(selectedItem.id, {
        name: formName,
        stockRef: formStockRef,
        category: formCategory,
        description: formDescription,
        quantity: Number(formQuantity),
        unitOfMeasure: formUnit,
        supplierId: formSupplierId,
        supplierName,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        reorderThreshold: Number(formReorderThreshold),
        notes: formNotes,
      });
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    } else {
      const res = addInventoryItem({
        stockRef: formStockRef,
        name: formName,
        category: formCategory,
        description: formDescription,
        quantity: Number(formQuantity),
        unitOfMeasure: formUnit,
        supplierId: formSupplierId,
        supplierName,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        reorderThreshold: Number(formReorderThreshold),
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: formNotes,
        batchNumber: formBatchNo,
        depotLocation: formDepotLocation,
        purchasedBy: `Procurement Desk (${currentRole})`,
      });
      if (!res.success) {
        setFormError(res.message);
        return;
      }
    }

    setIsAddModalOpen(false);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustQty(0);
    setAdjustReason('Tank dipping & temperature reconciliation');
    setAdjustError('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setAdjustError('');

    if (adjustQty === 0) {
      setAdjustError('Please specify a non-zero adjustment quantity (+/-).');
      return;
    }

    const res = adjustStock(selectedItem.id, Number(adjustQty), adjustReason);
    if (!res.success) {
      setAdjustError(res.message);
      return;
    }

    setIsAdjustModalOpen(false);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      alert('Supplier / Refinery name and phone are required.');
      return;
    }
    addSupplier({
      name: supName,
      contactPerson: supContact,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
      supplierRef: generateRef('SUP-OG', 3),
      category: supCategory,
      notes: supNotes,
    });
    setIsSupplierModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportData = filteredItems.map(i => ({
      ProductRef: i.stockRef,
      Name: i.name,
      Category: i.category,
      Quantity: i.quantity,
      Unit: i.unitOfMeasure,
      Status: i.status,
      CostPrice_NGN: i.costPrice,
      SellingPrice_NGN: i.sellingPrice,
      RefinerySupplier: i.supplierName,
      BatchNumber: i.lifecycle.batchNumber,
      DepotTank: i.lifecycle.depotTankLocation,
      TotalDispatched: i.lifecycle.totalQuantityDispatched,
      QACert: i.lifecycle.inspectionCertNumber,
    }));
    exportToCSV(exportData, 'Cooknow_Oil_Gas_Inventory_Ledger');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls & Secondary Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Petroleum Products & Hardware ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Depot Movements & Dipping Ledger ({stockMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Refineries & Terminal Suppliers ({suppliers.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'items' && (
            <>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>Export Ledger CSV</span>
              </button>
              <button
                onClick={() => handleOpenAddModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product Consignment</span>
              </button>
            </>
          )}

          {activeTab === 'suppliers' && (
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Refinery / Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* --- TAB 1: INVENTORY ITEMS --- */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search petroleum product or SKU..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-blue-500 font-medium"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-blue-500 font-medium"
              >
                <option value="all">All Product Categories</option>
                <option value="Refined Petroleum Products">Refined Petroleum (PMS, AGO, DPK)</option>
                <option value="Liquefied Petroleum Gas (LPG)">Liquefied Petroleum Gas (LPG)</option>
                <option value="Industrial Lubricants & Greases">Industrial Lubricants & Greases</option>
                <option value="Drilling, Valves & Piping Hardware">Drilling Hardware & API Valves</option>
                <option value="Heavy Pipeline & Flow Control">Heavy Pipeline & Flow Meters</option>
                <option value="Depot Safety & Terminal Equipment">Depot Safety & Terminal Spools</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-blue-500 font-medium"
              >
                <option value="all">All Tank Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <select
                value={supplierFilter}
                onChange={e => setSupplierFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-blue-500 font-medium"
              >
                <option value="all">All Refineries & Terminals</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product SKU</th>
                    <th className="py-3 px-4">Commodity / Equipment & Category</th>
                    <th className="py-3 px-4 text-center">Available Depot Stock</th>
                    <th className="py-3 px-4">Unit Cost / Price</th>
                    <th className="py-3 px-4">Refinery / Depot Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div>{item.stockRef}</div>
                        <span className="text-[10px] text-slate-500 font-normal">{item.lifecycle.batchNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-blue-700 font-medium mt-0.5">{item.category}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono text-sm font-bold ${
                            item.quantity === 0
                              ? 'text-rose-700'
                              : item.quantity <= item.reorderThreshold
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-600 ml-1 font-semibold">{item.unitOfMeasure}</span>
                        <div className="text-[10px] text-slate-500">
                          Min: {item.reorderThreshold.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{formatCurrency(item.sellingPrice)}</div>
                        <div className="text-[10px] text-slate-500">
                          Cost: {formatCurrency(item.costPrice)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium truncate max-w-[160px]">{item.supplierName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {item.lifecycle.depotTankLocation}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Full Product Lifecycle Button */}
                          <button
                            onClick={() => setInspectedProductLifecycleId(item.id)}
                            title="Inspect Complete Product Lifecycle from Purchase to Sale"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-blue-600" />
                            <span>Lifecycle</span>
                          </button>

                          <button
                            onClick={() => handleOpenAdjust(item)}
                            title="Reconcile / Adjust Stock"
                            className="p-1.5 rounded-md text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenAddModal(item)}
                            title="Edit Details"
                            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium text-slate-600">No matching petroleum inventory assets found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between font-medium">
              <span>Showing {filteredItems.length} of {inventory.length} Oil & Gas product consignments</span>
              <span className="font-mono text-[11px] text-slate-500">Cooknow Central Depot & Tank Farm</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: STOCK MOVEMENTS HISTORY --- */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Depot Dipping, Consignments & Movement Ledger</h3>
              <p className="text-xs text-slate-600">Traceable audit of tank transfers, client dispatches, and reversals</p>
            </div>
            <button
              onClick={() => {
                const data = stockMovements.map(m => ({
                  Date: m.date,
                  ItemRef: m.itemRef,
                  Product: m.itemName,
                  Type: m.movementType,
                  QuantityChange: m.quantity,
                  PreviousQty: m.previousQty,
                  NewQty: m.newQty,
                  Reference: m.reference,
                  Operator: m.operator,
                  Notes: m.notes,
                }));
                exportToCSV(data, 'Cooknow_Stock_Movements');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-center">Change Qty</th>
                  <th className="py-3 px-4 text-center">Stock Transition</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Officer / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono text-slate-600">{m.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{m.itemName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{m.itemRef}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.movementType === 'Stock Received'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : m.movementType === 'Stock Issued (Sale)'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : m.movementType === 'Stock Restored (Cancelled Sale)'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={m.quantity > 0 ? 'text-emerald-700' : 'text-slate-900'}>
                        {m.quantity > 0 ? `+${m.quantity.toLocaleString()}` : m.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 text-[11px]">
                      {m.previousQty.toLocaleString()} &rarr; <span className="font-bold text-slate-900">{m.newQty.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.reference}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold text-slate-900">{m.operator}: </span>
                      <span className="text-slate-600">{m.notes}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: SUPPLIERS DIRECTORY --- */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(sup => {
            const suppliedItems = inventory.filter(i => i.supplierId === sup.id);
            return (
              <div
                key={sup.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        {sup.supplierRef}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{sup.name}</h4>
                      <p className="text-xs text-blue-700 font-semibold">{sup.category}</p>
                    </div>
                    <Building2 className="w-5 h-5 text-slate-500" />
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <p>
                      <strong>Contact Officer:</strong> {sup.contactPerson}
                    </p>
                    <p>
                      <strong>Phone:</strong> {sup.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {sup.email}
                    </p>
                    <p>
                      <strong>Terminal / Depot:</strong> {sup.address}
                    </p>
                    {sup.notes && (
                      <p className="text-[11px] text-slate-600 italic mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                        "{sup.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Allocated <strong>{suppliedItems.length}</strong> active product consignments
                  </span>
                  <button
                    onClick={() => {
                      setSupplierFilter(sup.id);
                      setActiveTab('items');
                    }}
                    className="text-blue-700 hover:underline font-bold"
                  >
                    View supplied inventory &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT INVENTORY ITEM */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={selectedItem ? `Edit Consignment (${selectedItem.stockRef})` : 'Onboard New Petroleum Consignment'}
        subtitle="Initializes product lifecycle tracking from supplier refinery to customer sale"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Stock Reference SKU *
              </label>
              <input
                type="text"
                value={formStockRef}
                onChange={e => setFormStockRef(e.target.value)}
                required
                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as InventoryCategory)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-blue-500 font-medium"
              >
                <option value="Refined Petroleum Products">Refined Petroleum Products</option>
                <option value="Liquefied Petroleum Gas (LPG)">Liquefied Petroleum Gas (LPG)</option>
                <option value="Industrial Lubricants & Greases">Industrial Lubricants & Greases</option>
                <option value="Drilling, Valves & Piping Hardware">Drilling Hardware & API Valves</option>
                <option value="Heavy Pipeline & Flow Control">Heavy Pipeline & Flow Control</option>
                <option value="Depot Safety & Terminal Equipment">Depot Safety & Terminal Equipment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Petroleum Commodity / Equipment Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="E.g. Automotive Gas Oil (AGO / Diesel)"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min={0}
                value={formQuantity}
                onChange={e => setFormQuantity(Number(e.target.value))}
                required
                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                value={formUnit}
                onChange={e => setFormUnit(e.target.value)}
                placeholder="Litres / MT / Drums"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min={1}
                value={formReorderThreshold}
                onChange={e => setFormReorderThreshold(Number(e.target.value))}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Inbound Purchase Cost Price (₦ NGN)
              </label>
              <input
                type="number"
                min={0}
                value={formCostPrice}
                onChange={e => setFormCostPrice(Number(e.target.value))}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Outbound Selling Price (₦ NGN) *
              </label>
              <input
                type="number"
                min={0}
                value={formSellingPrice}
                onChange={e => setFormSellingPrice(Number(e.target.value))}
                required
                className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Refinery / Supplier Partner
              </label>
              <select
                value={formSupplierId}
                onChange={e => setFormSupplierId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-blue-500"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Depot Storage Tank Location
              </label>
              <input
                type="text"
                value={formDepotLocation}
                onChange={e => setFormDepotLocation(e.target.value)}
                placeholder="Tank 04 - Pinnacle Ibeju-Lekki Terminal"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Petroleum Technical Specifications & QA Notes
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Density, flashpoint, sulfur ppm, NMDPRA lab approval..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
            >
              {selectedItem ? 'Save Consignment Modifications' : 'Commit Consignment & Initialize Lifecycle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADJUST DEPOT QUANTITY */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock Quantity: ${selectedItem?.name}`}
        subtitle={`Current Depot Tank Level: ${selectedItem?.quantity.toLocaleString()} ${selectedItem?.unitOfMeasure}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          {adjustError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adjustError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity Adjustment (+ to add inbound, - to reconcile shrinkage)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={adjustQty}
                onChange={e => setAdjustQty(Number(e.target.value))}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
              <span className="text-xs text-slate-600 shrink-0 font-bold">{selectedItem?.unitOfMeasure}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Resulting Depot Level will be:{' '}
              <strong className="font-mono text-slate-900">
                {((selectedItem?.quantity || 0) + Number(adjustQty)).toLocaleString()} {selectedItem?.unitOfMeasure}
              </strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mandatory Dipping Reconciliation Reason
            </label>
            <select
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-blue-500 font-medium"
            >
              <option value="Tank dipping & temperature reconciliation">
                Tank dipping & temperature reconciliation
              </option>
              <option value="Evaporation / temperature shrinkage loss">
                Evaporation / temperature shrinkage loss
              </option>
              <option value="Terminal pipeline transfer top-up">
                Terminal pipeline transfer top-up
              </option>
              <option value="Refinery vessel supplementary discharge">
                Refinery vessel supplementary discharge
              </option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-xs cursor-pointer"
            >
              Post Dipping Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTER SUPPLIER / REFINERY */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Register Refinery / Terminal Supplier"
        subtitle="Maintains accredited petroleum refiners, coastal terminals, and pipeline depots"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Refinery / Terminal Company Name *
            </label>
            <input
              type="text"
              value={supName}
              onChange={e => setSupName(e.target.value)}
              placeholder="E.g. Pinnacle Oil & Gas Free Zone Offshore Terminal"
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={supContact}
                onChange={e => setSupContact(e.target.value)}
                placeholder="Capt. Efe Akpoveta"
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={supPhone}
                onChange={e => setSupPhone(e.target.value)}
                placeholder="+234 803 000 0000"
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Depot / Offshore Terminal Location
            </label>
            <input
              type="text"
              value={supAddress}
              onChange={e => setSupAddress(e.target.value)}
              placeholder="Offshore SPM Terminal, Lekki Free Trade Zone, Lagos"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs cursor-pointer"
            >
              Register Refinery Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
