import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CodexContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const CodexTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .add-button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.2rem;
    cursor: pointer;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const CodexList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.dark};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const CodexItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  position: relative;
  
  .quote {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-style: italic;
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }
  
  .source {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-align: right;
  }
  
  .delete-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  &:hover .delete-button {
    opacity: 1;
  }
`;

const EmptyCodex = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
`;

const AddCodexForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  padding-top: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.background.dark : theme.colors.accent};
  }
`;

// Sample codex entries
const initialCodexEntries = [
  {
    id: 1,
    quote: "Do not be defeated by loss and become one who could not love again, for that is when you have truly lost.",
    source: "Fire Keeper, Dark Souls 3"
  },
  {
    id: 2,
    quote: "Fear not the dark, my friend. And let the feast begin.",
    source: "Locust Preacher, Dark Souls 3"
  },
  {
    id: 3,
    quote: "Every adversity is an opportunity in disguise.",
    source: "Personal Affirmation"
  }
];

const CodexWidget = () => {
  const [codexEntries, setCodexEntries] = useState(initialCodexEntries);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newSource, setNewSource] = useState('');
  
  const handleAddEntry = (e) => {
    e.preventDefault();
    
    if (!newQuote.trim()) return;
    
    const newEntry = {
      id: Date.now(),
      quote: newQuote.trim(),
      source: newSource.trim() || 'Personal Affirmation'
    };
    
    setCodexEntries([...codexEntries, newEntry]);
    setNewQuote('');
    setNewSource('');
    setShowAddForm(false);
  };
  
  const handleDeleteEntry = (id) => {
    setCodexEntries(codexEntries.filter(entry => entry.id !== id));
  };
  
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewQuote('');
    setNewSource('');
  };
  
  return (
    <CodexContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CodexTitle>
        Knight's Codex
        {!showAddForm && (
          <button 
            className="add-button" 
            onClick={() => setShowAddForm(true)}
            title="Add new entry"
          >
            +
          </button>
        )}
      </CodexTitle>
      
      {showAddForm ? (
        <AddCodexForm onSubmit={handleAddEntry}>
          <FormGroup>
            <Label htmlFor="quote">Affirmation or Quote</Label>
            <TextArea 
              id="quote"
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              placeholder="Enter a meaningful quote or personal affirmation..."
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="source">Source (optional)</Label>
            <Input 
              id="source"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="Where is this from? (Leave blank for 'Personal Affirmation')"
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button type="button" onClick={handleCancelAdd}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Codex
            </Button>
          </ButtonGroup>
        </AddCodexForm>
      ) : (
        <CodexList>
          {codexEntries.length > 0 ? (
            codexEntries.map(entry => (
              <CodexItem key={entry.id}>
                <div className="quote">{entry.quote}</div>
                <div className="source">— {entry.source}</div>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteEntry(entry.id)}
                  title="Remove from codex"
                >
                  ✕
                </button>
              </CodexItem>
            ))
          ) : (
            <EmptyCodex>
              Your codex is empty. Add quotes and affirmations that inspire you.
            </EmptyCodex>
          )}
        </CodexList>
      )}
    </CodexContainer>
  );
};

export default CodexWidget;