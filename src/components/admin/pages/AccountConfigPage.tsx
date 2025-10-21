import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { adminConfigService } from '../../../services/adminConfigService';
import type { AccountType, Institution } from '../../../services/configService';
import { EditAccountTypeModal } from '../modals/EditAccountTypeModal';
import { EditInstitutionModal } from '../modals/EditInstitutionModal';
import { ConfirmDialog } from '../../ConfirmDialog';
import { ToastContainer } from '../../common/ToastContainer';
import type { ToastProps } from '../../common/Toast';

export const AccountConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'institutions'>('types');
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);

  // Toast and dialog states
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'account_type' | 'institution';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'account_type', id: '', name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, insts] = await Promise.all([
        adminConfigService.getAllAccountTypes(),
        adminConfigService.getAllInstitutions(),
      ]);
      setAccountTypes(types || []);
      setInstitutions(insts || []);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      showToast('Failed to load configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Account Type Handlers
  const handleCreateAccountType = async (data: Omit<AccountType, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    try {
      await adminConfigService.createAccountType(data);
      await loadData();
      showToast('Account type created successfully', 'success');
    } catch (error) {
      console.error('Failed to create account type:', error);
      showToast('Failed to create account type', 'error');
      throw error;
    }
  };

  const handleEditAccountType = async (id: string, data: Partial<AccountType>) => {
    try {
      await adminConfigService.updateAccountType(id, data);
      await loadData();
      showToast('Account type updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update account type:', error);
      showToast('Failed to update account type', 'error');
      throw error;
    }
  };

  const handleDeleteAccountType = async () => {
    try {
      await adminConfigService.deleteAccountType(deleteDialog.id);
      await loadData();
      showToast('Account type deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete account type:', error);
      showToast('Failed to delete account type', 'error');
    }
  };

  // Institution Handlers
  const handleCreateInstitution = async (data: Omit<Institution, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    try {
      await adminConfigService.createInstitution(data);
      await loadData();
      showToast('Institution created successfully', 'success');
    } catch (error) {
      console.error('Failed to create institution:', error);
      showToast('Failed to create institution', 'error');
      throw error;
    }
  };

  const handleEditInstitution = async (id: string, data: Partial<Institution>) => {
    try {
      await adminConfigService.updateInstitution(id, data);
      await loadData();
      showToast('Institution updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update institution:', error);
      showToast('Failed to update institution', 'error');
      throw error;
    }
  };

  const handleDeleteInstitution = async () => {
    try {
      await adminConfigService.deleteInstitution(deleteDialog.id);
      await loadData();
      showToast('Institution deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete institution:', error);
      showToast('Failed to delete institution', 'error');
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'account_type') {
      handleDeleteAccountType();
    } else {
      handleDeleteInstitution();
    }
    setDeleteDialog({ isOpen: false, type: 'account_type', id: '', name: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Configuration</h1>
        <p className="text-white/70">Manage account types and financial institutions</p>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('types')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'types'
              ? 'text-cyan-300 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Account Types ({accountTypes.length})
        </button>
        <button
          onClick={() => setActiveTab('institutions')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'institutions'
              ? 'text-cyan-300 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Institutions ({institutions.length})
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'types') {
                setEditingAccountType(null);
                setShowAccountTypeModal(true);
              } else {
                setEditingInstitution(null);
                setShowInstitutionModal(true);
              }
            }}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        <div className="space-y-3">
          {(activeTab === 'types' ? accountTypes : institutions).map((item) => (
            <div
              key={item.id}
              className="glass rounded-xl p-4 hover:bg-white/5 transition-all relative"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'types') {
                      setEditingAccountType(item as AccountType);
                      setShowAccountTypeModal(true);
                    } else {
                      setEditingInstitution(item as Institution);
                      setShowInstitutionModal(true);
                    }
                  }}
                  className="p-2 glass-button text-white rounded-lg hover:scale-110 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteDialog({
                    isOpen: true,
                    type: activeTab === 'types' ? 'account_type' : 'institution',
                    id: item.id,
                    name: item.display_name,
                  })}
                  className="p-2 glass text-red-400 hover:bg-red-500/10 rounded-lg hover:scale-110 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="pr-24">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{item.display_name}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    item.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-white/60">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-white/50 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Type Modal */}
      <EditAccountTypeModal
        isOpen={showAccountTypeModal || editingAccountType !== null}
        accountType={editingAccountType}
        onClose={() => {
          setShowAccountTypeModal(false);
          setEditingAccountType(null);
        }}
        onSave={handleEditAccountType}
        onCreate={handleCreateAccountType}
      />

      {/* Institution Modal */}
      <EditInstitutionModal
        isOpen={showInstitutionModal || editingInstitution !== null}
        institution={editingInstitution}
        onClose={() => {
          setShowInstitutionModal(false);
          setEditingInstitution(null);
        }}
        onSave={handleEditInstitution}
        onCreate={handleCreateInstitution}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete ${deleteDialog.type === 'account_type' ? 'Account Type' : 'Institution'}`}
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, type: 'account_type', id: '', name: '' })}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};
