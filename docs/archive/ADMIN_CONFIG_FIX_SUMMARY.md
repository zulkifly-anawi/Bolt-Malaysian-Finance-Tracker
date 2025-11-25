# Admin Configuration Fix - Complete Implementation Plan

**Issue**: Admin unable to add/edit/delete account types, institutions, categories, and templates

**Root Cause**: Missing modal components and event handlers

---

## Files Created

### 1. ✅ EditAccountTypeModal.tsx
- **Location**: `src/components/admin/modals/EditAccountTypeModal.tsx`
- **Status**: Created
- **Features**:
  - Add new account types
  - Edit existing account types
  - Form validation
  - Error handling
  - Loading states

### 2. ✅ EditInstitutionModal.tsx
- **Location**: `src/components/admin/modals/EditInstitutionModal.tsx`
- **Status**: Created
- **Features**:
  - Add new institutions
  - Edit existing institutions
  - Institution type selection
  - Form validation
  - Error handling
  - Loading states

### 3. ✅ EditCategoryModal.tsx (Updated)
- **Location**: `src/components/admin/modals/EditCategoryModal.tsx`
- **Status**: Updated
- **Changes**:
  - Added onCreate prop
  - Support for creating new categories
  - Added name and icon fields
  - Updated form to reset on close
  - Dynamic title (Add/Edit)

### 4. ⏳ EditTemplateModal.tsx (Needs Update)
- **Location**: `src/components/admin/modals/EditTemplateModal.tsx`
- **Status**: Needs update
- **Required Changes**:
  - Add onCreate prop
  - Support for creating new templates
  - Reset form when modal closes
  - Dynamic title (Add/Edit)

---

## Files That Need Updates

### 1. AccountConfigPage.tsx

**Current Issues**:
- No modal state management
- No event handlers on buttons
- Missing imports for modals

**Required Changes**:
```typescript
// Add imports
import { EditAccountTypeModal } from '../modals/EditAccountTypeModal';
import { EditInstitutionModal } from '../modals/EditInstitutionModal';
import { ToastContainer } from '../../common/ToastContainer';
import type { ToastProps } from '../../common/Toast';

// Add state
const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null);
const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
const [showInstitutionModal, setShowInstitutionModal] = useState(false);
const [toasts, setToasts] = useState<ToastProps[]>([]);
const [deleteDialog, setDeleteDialog] = useState<{
  isOpen: boolean;
  type: 'account_type' | 'institution';
  id: string;
  name: string;
}>({ isOpen: false, type: 'account_type', id: '', name: '' });

// Add handler functions
const handleCreateAccountType = async (data) => {
  await adminConfigService.createAccountType(data);
  await loadData();
  showToast('Account type created successfully', 'success');
};

const handleEditAccountType = async (id, data) => {
  await adminConfigService.updateAccountType(id, data);
  await loadData();
  showToast('Account type updated successfully', 'success');
};

const handleDeleteAccountType = async () => {
  await adminConfigService.deleteAccountType(deleteDialog.id);
  await loadData();
  showToast('Account type deleted successfully', 'success');
};

// Similar handlers for institutions

// Update "Add New" button
<button onClick={() => {
  if (activeTab === 'types') {
    setEditingAccountType(null);
    setShowAccountTypeModal(true);
  } else {
    setEditingInstitution(null);
    setShowInstitutionModal(true);
  }
}}>

// Update Edit buttons
<button onClick={() => {
  setEditingAccountType(item);
  setShowAccountTypeModal(true);
}}>

// Update Delete buttons
<button onClick={() => setDeleteDialog({
  isOpen: true,
  type: activeTab === 'types' ? 'account_type' : 'institution',
  id: item.id,
  name: item.display_name,
})}>

// Add modals at bottom
<EditAccountTypeModal
  isOpen={showAccountTypeModal}
  accountType={editingAccountType}
  onClose={() => {
    setShowAccountTypeModal(false);
    setEditingAccountType(null);
  }}
  onSave={handleEditAccountType}
  onCreate={handleCreateAccountType}
/>

<EditInstitutionModal
  isOpen={showInstitutionModal}
  institution={editingInstitution}
  onClose={() => {
    setShowInstitutionModal(false);
    setEditingInstitution(null);
  }}
  onSave={handleEditInstitution}
  onCreate={handleCreateInstitution}
/>

<ConfirmDialog
  isOpen={deleteDialog.isOpen}
  title={`Delete ${deleteDialog.type === 'account_type' ? 'Account Type' : 'Institution'}`}
  message={`Are you sure you want to delete "${deleteDialog.name}"?`}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
/>

<ToastContainer toasts={toasts} onClose={(id) => setToasts(toasts.filter(t => t.id !== id))} />
```

### 2. GoalConfigPage.tsx

**Current Issues**:
- "Add New" button has no onClick handler
- EditCategoryModal needs onCreate prop
- EditTemplateModal needs onCreate prop

**Required Changes**:
```typescript
// Add state
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [showTemplateModal, setShowTemplateModal] = useState(false);

// Add create handlers
const handleCreateCategory = async (data) => {
  await adminConfigService.createGoalCategory(data);
  await loadData();
  showToast('Category created successfully', 'success');
};

const handleCreateTemplate = async (data) => {
  await adminConfigService.createGoalTemplate(data);
  await loadData();
  showToast('Template created successfully', 'success');
};

// Update "Add New" button (line 154-157)
<button onClick={() => {
  if (activeTab === 'categories') {
    setEditingCategory(null);
    setShowCategoryModal(true);
  } else {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  }
}}>

// Update modal props
<EditCategoryModal
  isOpen={editingCategory !== null || showCategoryModal}
  category={editingCategory}
  onClose={() => {
    setEditingCategory(null);
    setShowCategoryModal(false);
  }}
  onSave={handleEditCategory}
  onCreate={handleCreateCategory}
/>

<EditTemplateModal
  isOpen={editingTemplate !== null || showTemplateModal}
  template={editingTemplate}
  onClose={() => {
    setEditingTemplate(null);
    setShowTemplateModal(false);
  }}
  onSave={handleEditTemplate}
  onCreate={handleCreateTemplate}
/>
```

---

## Implementation Status

### ✅ Completed
1. Created EditAccountTypeModal
2. Created EditInstitutionModal
3. Updated EditCategoryModal to support create mode

### ⏳ Remaining
1. Update EditTemplateModal to support create mode
2. Wire up AccountConfigPage with modals and handlers
3. Wire up GoalConfigPage "Add New" functionality
4. Test all CRUD operations

---

## Testing Checklist

### Account Config
- [ ] Add new account type
- [ ] Edit existing account type
- [ ] Delete account type
- [ ] Add new institution
- [ ] Edit existing institution
- [ ] Delete institution
- [ ] Toggle active/inactive status
- [ ] Reorder items (sort_order)

### Goal Config
- [ ] Add new category
- [ ] Edit existing category
- [ ] Delete category
- [ ] Add new template
- [ ] Edit existing template
- [ ] Delete template
- [ ] Toggle active/inactive status
- [ ] Reorder items (sort_order)

---

## Next Steps

1. Complete EditTemplateModal update
2. Update AccountConfigPage with full implementation
3. Update GoalConfigPage "Add New" button
4. Test all functionality
5. Commit and push changes

---

## Files Changed Summary

- ✅ Created: `src/components/admin/modals/EditAccountTypeModal.tsx`
- ✅ Created: `src/components/admin/modals/EditInstitutionModal.tsx`
- ✅ Modified: `src/components/admin/modals/EditCategoryModal.tsx`
- ⏳ Needs update: `src/components/admin/modals/EditTemplateModal.tsx`
- ⏳ Needs update: `src/components/admin/pages/AccountConfigPage.tsx`
- ⏳ Needs update: `src/components/admin/pages/GoalConfigPage.tsx`
