import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TachLockWidget from '../components/garage/TachLockWidget';
import GearShifterLock from '../components/garage/GearShifterLock';

const SafeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SafeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SafeTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SafeActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.evo.primary : 
    variant === 'secondary' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
  border: ${({ theme, variant }) => 
    variant === 'secondary' ? `1px solid ${theme.colors.evo.primary}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.evo.secondary : 
      variant === 'secondary' ? 'rgba(30, 50, 100, 0.1)' : theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const LockContainer = styled.div`
  margin-bottom: 2rem;
`;

const SafeContent = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const FilesContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const FilesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const FilesTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  .file-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
    color: ${({ theme, type }) => 
      type === 'image' ? theme.colors.accent : 
      type === 'document' ? theme.colors.evo.primary : 
      theme.colors.text.primary};
  }
  
  .file-info {
    flex: 1;
    
    .file-name {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: 0.25rem;
    }
    
    .file-meta {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.muted};
      display: flex;
      gap: 1rem;
    }
  }
  
  .file-actions {
    display: flex;
    gap: 0.5rem;
    
    button {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.text.muted};
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      transition: color ${({ theme }) => theme.transitions.fast};
      
      &:hover {
        color: ${({ theme }) => theme.colors.accent};
      }
    }
  }
`;

const NotesContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const NotesTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotesContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoteItem = styled.div`
  padding: 1rem;
  background-color: ${({ theme, color }) => 
    color === 'yellow' ? 'rgba(199, 167, 88, 0.1)' : 
    color === 'blue' ? 'rgba(30, 50, 100, 0.1)' : 
    color === 'red' ? 'rgba(138, 3, 3, 0.1)' : 
    theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme, color }) => 
    color === 'yellow' ? theme.colors.accent : 
    color === 'blue' ? theme.colors.evo.primary : 
    color === 'red' ? theme.colors.primary : 
    theme.colors.secondary};
  
  .note-title {
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  .note-content {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;
  }
  
  .note-date {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: 0.75rem;
    text-align: right;
  }
`;

const AddNoteButton = styled(Button)`
  align-self: flex-end;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 500px;
    margin-bottom: 2rem;
  }
`;

// Mock data
const mockFiles = [
  {
    id: 1,
    name: 'evo_ix_mods.pdf',
    type: 'document',
    size: '2.4 MB',
    date: '2025-09-20'
  },
  {
    id: 2,
    name: 'solaire_cosplay.jpg',
    type: 'image',
    size: '3.8 MB',
    date: '2025-09-15'
  },
  {
    id: 3,
    name: 'dark_souls_boss_guide.pdf',
    type: 'document',
    size: '5.1 MB',
    date: '2025-09-10'
  },
  {
    id: 4,
    name: 'elden_ring_map.jpg',
    type: 'image',
    size: '7.2 MB',
    date: '2025-09-05'
  }
];

const mockNotes = [
  {
    id: 1,
    title: 'Evo IX Tuning Notes',
    content: 'Need to adjust the boost controller settings. Currently running at 20 psi but might need to lower it for daily driving. Also check the air/fuel ratios at higher RPMs.',
    date: '2025-09-22',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Malenia Strategy',
    content: 'Phase 1: Stay aggressive but watch for the Waterfowl Dance. Phase 2: Use Bloodhound Step to avoid the flower attack at the beginning. Frost weapons seem effective.',
    date: '2025-09-18',
    color: 'red'
  },
  {
    id: 3,
    title: 'Cosplay Ideas',
    content: 'Solaire armor almost complete. Need to find better material for the sun emblem. Consider adding LED lights for the "Praise the Sun" pose.',
    date: '2025-09-15',
    color: 'yellow'
  }
];

const SafeView = () => {
  const [authStep, setAuthStep] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [files, setFiles] = useState(mockFiles);
  const [notes, setNotes] = useState(mockNotes);
  
  const handleTachUnlock = () => {
    setAuthStep(2);
  };
  
  const handleGearUnlock = () => {
    setIsUnlocked(true);
  };
  
  const handleAddNote = () => {
    // In a real app, this would open a form to add a new note
    alert('Add note functionality would go here!');
  };
  
  return (
    <SafeContainer>
      <SafeHeader>
        <SafeTitle>The Garage</SafeTitle>
        {isUnlocked && (
          <SafeActions>
            <Button variant="secondary">
              Add File
            </Button>
          </SafeActions>
        )}
      </SafeHeader>
      
      {!isUnlocked ? (
        <LockContainer>
          {authStep === 1 ? (
            <TachLockWidget onUnlock={handleTachUnlock} />
          ) : (
            <GearShifterLock onUnlock={handleGearUnlock} />
          )}
        </LockContainer>
      ) : (
        <SafeContent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FilesContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FilesHeader>
              <FilesTitle>Secure Files</FilesTitle>
            </FilesHeader>
            
            {files.length > 0 ? (
              <FilesList>
                {files.map(file => (
                  <FileItem key={file.id} type={file.type}>
                    <div className="file-icon">
                      {file.type === 'document' ? '📄' : '🖼️'}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span>{file.size}</span>
                        <span>{new Date(file.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button title="Download">📥</button>
                      <button title="Delete">🗑️</button>
                    </div>
                  </FileItem>
                ))}
              </FilesList>
            ) : (
              <EmptyState>
                <div className="icon">📁</div>
                <h3>No Files Yet</h3>
                <p>
                  Your secure files will appear here. Add your first file to get started.
                </p>
                <Button variant="secondary">
                  Add File
                </Button>
              </EmptyState>
            )}
          </FilesContainer>
          
          <NotesContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NotesHeader>
              <NotesTitle>Notes</NotesTitle>
            </NotesHeader>
            
            <NotesContent>
              {notes.map(note => (
                <NoteItem key={note.id} color={note.color}>
                  <div className="note-title">{note.title}</div>
                  <div className="note-content">{note.content}</div>
                  <div className="note-date">{new Date(note.date).toLocaleDateString()}</div>
                </NoteItem>
              ))}
            </NotesContent>
            
            <AddNoteButton variant="secondary" onClick={handleAddNote}>
              Add Note
            </AddNoteButton>
          </NotesContainer>
        </SafeContent>
      )}
    </SafeContainer>
  );
};

export default SafeView;