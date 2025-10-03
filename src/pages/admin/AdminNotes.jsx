import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabaseClient';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
  
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const CreateSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 
    variant === 'danger' ? theme.colors.status.error : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' || variant === 'danger' ? theme.colors.background.dark : theme.colors.accent};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'danger' ? theme.colors.status.error : theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoteCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const NoteTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const NoteStatus = styled.span`
  padding: 0.25rem 0.75rem;
  background-color: ${({ theme, active }) => 
    active ? 'rgba(77, 126, 62, 0.2)' : 'rgba(138, 3, 3, 0.2)'};
  color: ${({ theme, active }) => 
    active ? theme.colors.status.success : theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.85rem;
  font-weight: 600;
`;

const NoteContent = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const NoteDate = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const NoteActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AdminNotes = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert({
          title: title.trim(),
          content: content.trim(),
          created_by: user.id,
          is_active: true
        });

      if (error) throw error;

      showToast('Note created successfully!', 'success');
      setTitle('');
      setContent('');
      await loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      showToast('Failed to create note', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (noteId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .update({ is_active: !currentStatus })
        .eq('id', noteId);

      if (error) throw error;

      showToast(`Note ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      await loadNotes();
    } catch (error) {
      console.error('Error toggling note:', error);
      showToast('Failed to update note', 'error');
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      showToast('Note deleted', 'success');
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Failed to delete note', 'error');
    }
  };

  return (
    <Container>
      <Header>
        <h1>📜 Admin Notes Management</h1>
        <p>Create and manage messages from Warden Aleix of the Psychological Citadel</p>
      </Header>

      <CreateSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Create New Note</h2>
        
        <FormGroup>
          <label htmlFor="title">Title</label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            disabled={submitting}
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="content">Content</label>
          <TextArea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content..."
            disabled={submitting}
          />
        </FormGroup>

        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={submitting || !title.trim() || !content.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? 'Creating...' : 'Create Note'}
        </Button>
      </CreateSection>

      <h2 style={{ marginBottom: '1rem' }}>All Notes</h2>
      
      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length > 0 ? (
        <NotesList>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <NoteHeader>
                <NoteTitle>{note.title}</NoteTitle>
                <NoteStatus active={note.is_active}>
                  {note.is_active ? 'Active' : 'Inactive'}
                </NoteStatus>
              </NoteHeader>

              <NoteContent>{note.content}</NoteContent>

              <NoteFooter>
                <NoteDate>
                  Created {new Date(note.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </NoteDate>

                <NoteActions>
                  <Button
                    variant="secondary"
                    onClick={() => handleToggleActive(note.id, note.is_active)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {note.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(note.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </Button>
                </NoteActions>
              </NoteFooter>
            </NoteCard>
          ))}
        </NotesList>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No notes yet. Create your first note above!</p>
      )}
    </Container>
  );
};

export default AdminNotes;