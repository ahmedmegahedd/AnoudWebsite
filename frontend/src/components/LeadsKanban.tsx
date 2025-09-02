import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'In Discussion' | 'Converted' | 'Lost';
  customColumnId?: string;
  leadSource: 'Website Form' | 'Manual' | 'Referral' | 'Other';
  notes?: string;
  followUpDate?: string;
  followUpStatus: 'Pending' | 'Completed' | 'Overdue';
  createdAt: string;
  updatedAt: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  leads: Lead[];
  isCustom?: boolean;
}

interface LeadsKanbanProps {
  leads: Lead[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onLeadDelete: (leadId: string) => Promise<void>;
}

// Draggable Lead Card Component
const SortableLeadCard: React.FC<{ 
  lead: Lead; 
  onEdit: () => void; 
  onDelete: () => void; 
}> = ({ lead, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: isDragging ? '0 8px 16px rgba(0, 0, 0, 0.2)' : 'var(--shadow-sm)',
        cursor: 'grab',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
            {lead.contactPerson}
          </h4>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lead.companyName}
          </p>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lead.email}
          </p>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lead.phone}
          </p>
          {lead.notes && (
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              lineHeight: '1.3'
            }}>
              {lead.notes.length > 60 ? `${lead.notes.substring(0, 60)}...` : lead.notes}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              cursor: 'pointer',
              minWidth: '40px'
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            style={{
              background: 'var(--error)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              cursor: 'pointer',
              minWidth: '40px'
            }}
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Follow-up info */}
      {lead.followUpDate && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.25rem 0.5rem', 
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.7rem'
        }}>
          <div>Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}</div>
          <span style={{
            padding: '0.1rem 0.3rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.6rem',
            fontWeight: 600,
            color: 'white',
            background: lead.followUpStatus === 'Overdue' ? 'var(--error)' : 
                       lead.followUpStatus === 'Completed' ? 'var(--success)' : 'var(--warning)'
          }}>
            {lead.followUpStatus}
          </span>
        </div>
      )}
    </div>
  );
};

// Droppable Column Component
const DroppableColumn: React.FC<{ 
  column: KanbanColumn; 
  onEdit: (lead: Lead) => void; 
  onDelete: (leadId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  deletedDefaultColumns: string[];
}> = ({ column, onEdit, onDelete, onDeleteColumn, deletedDefaultColumns }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '320px',
        background: isOver ? 'var(--bg-secondary)' : 'var(--background-secondary)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        border: isOver ? '2px solid var(--primary)' : '1px solid var(--border)',
        transition: 'all 0.2s ease',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      {/* Drop indicator overlay */}
      {isOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 123, 255, 0.1)',
          borderRadius: 'var(--radius)',
          border: '2px dashed var(--primary)',
          pointerEvents: 'none',
          zIndex: 10,
          animation: 'pulse 1s infinite'
        }} />
      )}

      {/* Column Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{column.title}</h3>
          <span style={{
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {column.leads.length}
          </span>
        </div>
        {(column.isCustom && column.leads.length === 0) || 
         (!column.isCustom && column.id !== 'New' && column.leads.length === 0 && !deletedDefaultColumns.includes(column.id)) ? (
          <button
            onClick={() => onDeleteColumn(column.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--error)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--error)';
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {/* Column Content */}
      <SortableContext
        items={column.leads.map(lead => lead._id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ minHeight: '100px' }}>
          {column.leads.map((lead) => (
            <SortableLeadCard
              key={lead._id}
              lead={lead}
              onEdit={() => onEdit(lead)}
              onDelete={() => onDelete(lead._id)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Empty state */}
      {column.leads.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          padding: '2rem 0',
          fontStyle: 'italic',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius)',
          marginTop: '1rem'
        }}>
          Drop leads here
        </div>
      )}
    </div>
  );
};

// Main Kanban Component
const LeadsKanban: React.FC<LeadsKanbanProps> = ({ leads, onLeadUpdate, onLeadDelete }) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<KanbanColumn[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletedDefaultColumns, setDeletedDefaultColumns] = useState<string[]>([]);

  // Load custom columns from backend
  const loadCustomColumns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/custom-columns`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const loadedColumns = data.customColumns.map((col: any) => ({
          id: col.id,
          title: col.title,
          leads: [],
          isCustom: true
        }));
        setCustomColumns(loadedColumns);
      }
    } catch (error) {
      console.error('Error loading custom columns:', error);
    }
  };

  // Save custom columns to backend
  const saveCustomColumns = async (columnsToSave: KanbanColumn[]) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/custom-columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customColumns: columnsToSave.map(col => ({
            id: col.id,
            title: col.title,
            order: 0
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save custom columns');
      }

      showNotification('Custom columns saved successfully', 'success');
    } catch (error) {
      console.error('Error saving custom columns:', error);
      showNotification('Failed to save custom columns', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete custom column from backend
  const deleteCustomColumn = async (columnId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LEADS}/custom-columns/${columnId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete custom column');
      }

      showNotification('Custom column deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting custom column:', error);
      showNotification('Failed to delete custom column', 'error');
    }
  };

  // Load custom columns on component mount
  useEffect(() => {
    loadCustomColumns();
  }, []);

  // Initialize columns from leads data
  useEffect(() => {
    console.log('🔄 Initializing columns with leads:', leads.length);
    console.log('📋 Lead statuses:', leads.map(l => ({ id: l._id, status: l.status, name: l.contactPerson })));
    
    // Group leads by status
    const statusGroups = leads.reduce((acc, lead) => {
      const status = lead.status || 'New';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    // Create default columns from lead statuses (excluding deleted ones)
    const defaultColumns: KanbanColumn[] = Object.entries(statusGroups)
      .filter(([status]) => !deletedDefaultColumns.includes(status))
      .map(([status, leads]) => ({
        id: status,
        title: status,
        leads,
        isCustom: false
      }));

    // Add default columns if none exist
    if (defaultColumns.length === 0) {
      defaultColumns.push({
        id: 'New',
        title: 'New',
        leads: [],
        isCustom: false
      });
    }

    // Merge with custom columns
    const mergedColumns = [...defaultColumns, ...customColumns];
    
    // Update leads in all columns based on current leads data
    const updatedColumns = mergedColumns.map(col => {
      if (col.isCustom) {
        // For custom columns, find leads that are specifically assigned to this column
        const filteredLeads = leads.filter(lead => lead.customColumnId === col.id);
        console.log(`🔍 Custom column "${col.title}" (${col.id}) found ${filteredLeads.length} leads with customColumnId`);
        return {
          ...col,
          leads: filteredLeads
        };
      } else {
        // For default columns, find leads with matching status AND no custom column assignment
        const filteredLeads = leads.filter(lead => 
          (lead.status === col.id || (col.id === 'New' && (!lead.status || lead.status === 'New'))) &&
          !lead.customColumnId
        );
        console.log(`🔍 Default column "${col.title}" (${col.id}) found ${filteredLeads.length} leads (excluding custom column leads)`);
        return {
          ...col,
          leads: filteredLeads
        };
      }
    });
    
    console.log('📊 Updated columns:', updatedColumns.map(col => ({ id: col.id, title: col.title, leadCount: col.leads.length })));
    setColumns(updatedColumns);
  }, [leads, customColumns]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map custom column titles to valid status values
  const mapColumnToStatus = (columnId: string, columnTitle: string): Lead['status'] => {
    if (['New', 'Contacted', 'In Discussion', 'Converted', 'Lost'].includes(columnId)) {
      return columnId as Lead['status'];
    }
    
    const titleLower = columnTitle.toLowerCase();
    if (titleLower.includes('contact') || titleLower.includes('reach') || titleLower.includes('prospect')) {
      return 'Contacted';
    } else if (titleLower.includes('discuss') || titleLower.includes('meet') || titleLower.includes('negotiate')) {
      return 'In Discussion';
    } else if (titleLower.includes('convert') || titleLower.includes('won') || titleLower.includes('deal')) {
      return 'Converted';
    } else if (titleLower.includes('lost') || titleLower.includes('reject') || titleLower.includes('no')) {
      return 'Lost';
    } else {
      // Default to Contacted for any other custom column
      return 'Contacted';
    }
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    console.log('🎯 Drag started:', event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    console.log('🔄 Drag over:', { active: active.id, over: over.id });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setIsDragging(false);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    console.log('🎯 Drag ended:', { active: activeId, over: overId });

    if (activeId === overId) {
      setIsDragging(false);
      return;
    }

    try {
      const activeColumn = columns.find(col => col.leads.some(lead => lead._id === activeId));
      const overColumn = columns.find(col => col.id === overId);
      const overLead = columns.flatMap(col => col.leads).find(lead => lead._id === overId);

      if (!activeColumn) {
        console.log('❌ Active column not found');
        setIsDragging(false);
        return;
      }

      const activeLead = activeColumn.leads.find(lead => lead._id === activeId);
      if (!activeLead) {
        console.log('❌ Active lead not found');
        setIsDragging(false);
        return;
      }

              // Dropping on a column
        if (overColumn && !overLead) {
          console.log('📥 Dropping on column:', overColumn.title);
          
          if (activeColumn.id === overColumn.id) {
            console.log('🔄 Same column, no action needed');
            setIsDragging(false);
            return;
          }

          if (overColumn.isCustom) {
            // Moving to a custom column
            console.log('🔄 Moving lead to custom column:', overColumn.title);
            await onLeadUpdate(activeId as string, { customColumnId: overColumn.id });
            showNotification(`Lead moved to ${overColumn.title}`, 'success');
          } else {
            // Moving to a default column - clear customColumnId and set status
            console.log('🔄 Moving lead to default column:', overColumn.title);
            await onLeadUpdate(activeId as string, { 
              status: overColumn.id as Lead['status'],
              customColumnId: undefined 
            });
            showNotification(`Lead moved to ${overColumn.title}`, 'success');
          }
        }
      // Dropping on another lead
      else if (overLead) {
        console.log('📥 Dropping on lead:', overLead.contactPerson);
        
        const overLeadColumn = columns.find(col => col.leads.some(lead => lead._id === overId));
        
        if (!overLeadColumn) {
          console.log('❌ Over lead column not found');
          setIsDragging(false);
          return;
        }

        // Same column reordering
        if (overLeadColumn.id === activeColumn.id) {
          console.log('🔄 Reordering within same column');
          
          const oldIndex = activeColumn.leads.findIndex(lead => lead._id === activeId);
          const newIndex = activeColumn.leads.findIndex(lead => lead._id === overId);

          if (oldIndex !== newIndex) {
            setColumns(prevColumns => {
              return prevColumns.map(col => {
                if (col.id === activeColumn.id) {
                  const newLeads = arrayMove(col.leads, oldIndex, newIndex);
                  return { ...col, leads: newLeads };
                }
                return col;
              });
            });
            showNotification('Lead reordered', 'success');
          }
        } 
        // Different column move
        else {
          console.log('🔄 Moving to different column:', overLeadColumn.title);
          
          if (overLeadColumn.isCustom) {
            // Moving to a custom column
            console.log('🔄 Moving lead to custom column:', overLeadColumn.title);
            await onLeadUpdate(activeId as string, { customColumnId: overLeadColumn.id });
            showNotification(`Lead moved to ${overLeadColumn.title}`, 'success');
          } else {
            // Moving to a default column - clear customColumnId and set status
            console.log('🔄 Moving lead to default column:', overLeadColumn.title);
            await onLeadUpdate(activeId as string, { 
              status: overLeadColumn.id as Lead['status'],
              customColumnId: undefined 
            });
            showNotification(`Lead moved to ${overLeadColumn.title}`, 'success');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in drag end handler:', error);
      showNotification('Failed to move lead', 'error');
    } finally {
      setIsDragging(false);
    }
  };

  // Column management
  const addColumn = async () => {
    if (!newColumnName.trim()) {
      showNotification('Please enter a column name', 'warning');
      return;
    }

    const columnExists = columns.some(col => col.title.toLowerCase() === newColumnName.trim().toLowerCase());
    if (columnExists) {
      showNotification('A column with this name already exists', 'error');
      return;
    }

    const newColumn: KanbanColumn = {
      id: `custom-${Date.now()}`,
      title: newColumnName.trim(),
      leads: [],
      isCustom: true
    };

    const updatedCustomColumns = [...customColumns, newColumn];
    setCustomColumns(updatedCustomColumns);
    
    // Save to backend
    await saveCustomColumns(updatedCustomColumns);
    
    setNewColumnName('');
    setShowAddColumn(false);
  };

  const deleteColumn = async (columnId: string) => {
    // Check if it's a custom column
    const isCustomColumn = customColumns.some(col => col.id === columnId);
    
    if (isCustomColumn) {
      // Delete custom column
      const updatedCustomColumns = customColumns.filter(col => col.id !== columnId);
      setCustomColumns(updatedCustomColumns);
      
      // Save to backend
      await saveCustomColumns(updatedCustomColumns);
      
      // Delete from backend
      await deleteCustomColumn(columnId);
    } else {
      // For default columns, move any leads to "New" status and delete the column
      const leadsInColumn = leads.filter(lead => lead.status === columnId && !lead.customColumnId);
      
      // Move leads to "New" status
      for (const lead of leadsInColumn) {
        await onLeadUpdate(lead._id, { 
          status: 'New' as Lead['status'],
          customColumnId: undefined 
        });
      }
      
      // Permanently delete the column from the UI
      setDeletedDefaultColumns(prev => [...prev, columnId]);
      
      if (leadsInColumn.length > 0) {
        showNotification(`Column "${columnId}" deleted. ${leadsInColumn.length} leads moved to "New"`, 'success');
      } else {
        showNotification(`Column "${columnId}" deleted`, 'success');
      }
    }
  };

  // Lead management
  const handleLeadEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleLeadDelete = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await onLeadDelete(leadId);
        showNotification('Lead deleted successfully', 'success');
      } catch (error) {
        showNotification('Failed to delete lead', 'error');
      }
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ margin: 0 }}>📋 Leads Kanban Board</h2>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            💡 Drag leads between columns to update their status
          </p>
        </div>
        <button
          onClick={() => setShowAddColumn(true)}
          disabled={loading}
          style={{
            background: loading ? 'var(--text-secondary)' : 'var(--success)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <span>+</span>
          {loading ? 'Saving...' : 'Add Column'}
        </button>
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: 'var(--radius)',
            minWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Add New Column</h3>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Enter column name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addColumn()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnName('');
                }}
                style={{
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addColumn}
                style={{
                  background: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: 'var(--radius)',
            minWidth: '500px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Edit Lead</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={editingLead.companyName}
                  onChange={(e) => setEditingLead({ ...editingLead, companyName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Contact Person
                </label>
                <input
                  type="text"
                  value={editingLead.contactPerson}
                  onChange={(e) => setEditingLead({ ...editingLead, contactPerson: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Phone
                </label>
                <input
                  type="text"
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Status
                </label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as Lead['status'] })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Notes
                </label>
                <textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={() => setEditingLead(null)}
                style={{
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await onLeadUpdate(editingLead._id, editingLead);
                    setEditingLead(null);
                  } catch (error) {
                    showNotification('Failed to update lead', 'error');
                  }
                }}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          overflowX: 'auto', 
          paddingBottom: '1rem',
          minHeight: '600px'
        }}>
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              onEdit={handleLeadEdit}
              onDelete={handleLeadDelete}
              onDeleteColumn={deleteColumn}
              deletedDefaultColumns={deletedDefaultColumns}
            />
          ))}
        </div>
      </DndContext>

      {/* Global drag indicator */}
      {isDragging && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--primary)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: 'var(--radius)',
          zIndex: 2000,
          pointerEvents: 'none',
          animation: 'pulse 1s infinite'
        }}>
          🎯 Dragging lead...
        </div>
      )}
    </div>
  );
};

export default LeadsKanban; 