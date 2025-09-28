import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';
import MoodGauge from '../components/dashboard/MoodGauge';
import { processJournalEntry, JOURNAL_AI_MODES } from '../services/journalAiClient';

const JournalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const JournalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const JournalTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const JournalActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : 
    variant === 'secondary' ? 'transparent' : theme.colors.accent};
  color: ${({ theme, variant }) =>
    variant === 'primary' ? theme.colors.background.dark : theme.colors.text.primary};
  border: ${({ theme, variant }) => 
    variant === 'secondary' ? `1px solid ${theme.colors.accent}` : 'none'};
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
      variant === 'primary' ? theme.colors.primary : 
      variant === 'secondary' ? 'rgba(199, 167, 88, 0.1)' : theme.colors.accent};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
  }
`;

const JournalContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const EditorCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleInput = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1.5rem;
  padding: 0.5rem 0;
  width: 100%;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const DateDisplay = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
`;

const WordCount = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.div`
  padding: 0.25rem 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .remove-tag {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.muted};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const AddTagInput = styled.input`
  padding: 0.25rem 0.5rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px dashed ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AIInsightsCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
`;

const AIInsightsTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .ai-icon {
    font-size: 1rem;
  }
`;

const AIContent = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.6;
  
  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 1rem 0 0.5rem;
    font-size: 1rem;
  }
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
  
  .highlight {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 500;
  }
  
  .suggestion {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: rgba(199, 167, 88, 0.1);
    border-radius: ${({ theme }) => theme.borderRadius.small};
    border-left: 3px solid ${({ theme }) => theme.colors.accent};
  }
`;

const EmptyAIState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  
  .ai-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const AITabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.dark};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const AITab = styled.button`
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid ${({ theme, active }) => 
    active ? theme.colors.accent : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const JournalHistoryCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const JournalHistoryTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const JournalEntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
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

const JournalEntryItem = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme, isSelected }) => isSelected ? 'rgba(199, 167, 88, 0.1)' : theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme, isSelected }) => isSelected ? theme.colors.accent : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(199, 167, 88, 0.05);
  }
  
  .entry-title {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  
  .entry-preview {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .entry-date {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: 0.5rem;
  }
`;

const EmptyHistoryState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
  font-size: 0.9rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-top: 3px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AskAIForm = styled.div`
  margin-top: 1rem;
  
  .form-header {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  .input-container {
    display: flex;
    gap: 0.5rem;
    
    input {
      flex: 1;
      padding: 0.5rem;
      background-color: ${({ theme }) => theme.colors.background.dark};
      border: 1px solid ${({ theme }) => theme.colors.secondary};
      border-radius: ${({ theme }) => theme.borderRadius.small};
      color: ${({ theme }) => theme.colors.text.primary};
      font-family: ${({ theme }) => theme.fonts.tertiary};
      font-size: 0.9rem;
      
      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.accent};
      }
    }
    
    button {
      padding: 0.5rem;
      background-color: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.background.dark};
      border: none;
      border-radius: ${({ theme }) => theme.borderRadius.small};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        opacity: 0.9;
      }
      
      &:disabled {
        background-color: ${({ theme }) => theme.colors.secondary};
        cursor: not-allowed;
      }
    }
  }
`;

const RewriteForm = styled.div`
  margin-top: 1rem;
  
  .form-header {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  .tone-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .tone-option {
    padding: 0.5rem 1rem;
    background-color: ${({ theme, selected }) => 
      selected ? theme.colors.accent : theme.colors.background.dark};
    color: ${({ theme, selected }) => 
      selected ? theme.colors.background.dark : theme.colors.text.secondary};
    border: 1px solid ${({ theme, selected }) => 
      selected ? theme.colors.accent : theme.colors.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: 0.9rem;
    cursor: pointer;
    
    &:hover {
      background-color: ${({ theme, selected }) => 
        selected ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    }
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.background.dark};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
      opacity: 0.9;
    }
    
    &:disabled {
      background-color: ${({ theme }) => theme.colors.secondary};
      cursor: not-allowed;
    }
  }
`;

const Journal = () => {
  const { user } = useAuth();
  const addToast = useToast();

  // State for the list of entries
  const [entries, setEntries] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // State for the currently selected/edited entry
  const [currentEntry, setCurrentEntry] = useState(null);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalText, setJournalText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [mood, setMood] = useState(50);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // State for AI functionality
  const [activeAITab, setActiveAITab] = useState('insights');
  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setDbLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setDbLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJournalText(text);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/)?.length);
  };
  
  const resetEditor = () => {
    setCurrentEntry(null);
    setJournalTitle('');
    setJournalText('');
    setWordCount(0);
    setMood(50);
    setTags([]);
    setAiResults({});
  };

  const handleNewEntry = () => {
    resetEditor();
  };

  const handleSelectEntry = (entry) => {
    setCurrentEntry(entry);
    setJournalTitle(entry.title || '');
    setJournalText(entry.content || '');
    setWordCount(entry.content?.trim() === '' ? 0 : entry.content?.trim().split(/\s+/).length || 0);
    setMood(entry.mood || 50);
    setTags(entry.tags || []);
    setAiResults({
      insights: entry.ai_insights,
      summary: entry.ai_summary,
      actions: entry.ai_actions,
    });
  };

  const handleSave = async () => {
    if (!user || journalText.trim().length === 0) return;
    
    setDbLoading(true);

    const entryData = {
      user_id: user.id,
      title: journalTitle,
      content: journalText,
      mood,
      tags,
    };

    try {
      if (currentEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', currentEntry.id);
        if (error) throw error;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryData)
          .select();
        if (error) throw error;
        setCurrentEntry(data[0]); // Set the new entry as the current one
      }
      await fetchEntries(); // Refresh the list
      alert('Journal entry saved!');
    } catch (error) {
      console.error("Error saving entry:", error);
      alert('Failed to save entry.');
    } finally {
      setDbLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentEntry) return;

    if (window.confirm("Are you sure you want to delete this entry?")) {
      setDbLoading(true);
      try {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', currentEntry.id);
        if (error) throw error;

        resetEditor();
        await fetchEntries();
        alert('Entry deleted.');
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert('Failed to delete entry.');
      } finally {
        setDbLoading(false);
      }
    }
  };
  
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleRequestAI = async (mode) => {
    if (journalText.trim().length < 20) return;

    setAiLoading(true);
    try {
      const result = await processJournalEntry(mode, {
        title: journalTitle,
        content: journalText,
        mood,
        tags,
        question: askQuestion,
        tone: selectedTone,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setAiResults(prev => ({ ...prev, ...result }));

      // If we have an entry, save the AI results to the database
      if (currentEntry && result) {
        const updateData = {};
        if(result.insights) updateData.ai_insights = result.insights;
        if(result.summary) updateData.ai_summary = result.summary;
        if(result.actions) updateData.ai_actions = result.actions;

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('journal_entries')
            .update(updateData)
            .eq('id', currentEntry.id);

          if (error) throw error;
          await fetchEntries(); // Refresh data
        }
      }

    } catch (error) {
      console.error(`Error getting AI ${mode}:`, error);
      addToast(`AI ${mode} failed. Please try again.`, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const renderAIContent = () => {
    if (journalText.trim().length < 20) {
      return (
        <EmptyAIState>
          <div className="ai-icon">🧠</div>
          <p>Write at least 20 words and click one of the AI options to receive personalized analysis.</p>
        </EmptyAIState>
      );
    }
    
    switch (activeAITab) {
      case 'insights':
        if (aiResults.insights) return <AIContent><p>{aiResults.insights}</p></AIContent>;
        return <Button onClick={() => handleRequestAI(JOURNAL_AI_MODES.INSIGHTS)}>Get AI Insights</Button>;
      case 'summary':
        if (aiResults.summary) return <AIContent><p>{aiResults.summary}</p></AIContent>;
        return <Button onClick={() => handleRequestAI(JOURNAL_AI_MODES.SUMMARIZE)}>Summarize Entry</Button>;
      case 'actions':
        if (aiResults.actions) return <AIContent><p>{aiResults.actions}</p></AIContent>;
        return <Button onClick={() => handleRequestAI(JOURNAL_AI_MODES.ACTIONS)}>Suggest Actions</Button>;
      case 'ask':
        return (
          <AIContent>
            {aiResults.answer && <div className="suggestion"><strong>Answer:</strong> {aiResults.answer}</div>}
            <AskAIForm>
              <div className="input-container">
                <input type="text" value={askQuestion} onChange={(e) => setAskQuestion(e.target.value)} placeholder="Ask about your entry..." />
                <button onClick={() => handleRequestAI(JOURNAL_AI_MODES.ASK)} disabled={!askQuestion.trim()}>Ask</button>
              </div>
            </AskAIForm>
          </AIContent>
        );
      case 'rewrite':
        return (
          <AIContent>
            {aiResults.rewrite && <div className="suggestion"><strong>Rewritten:</strong><p>{aiResults.rewrite}</p></div>}
            <RewriteForm>
              <div className="tone-options">
                {['Positive', 'Reflective', 'Grateful'].map(tone => (
                  <button key={tone} className="tone-option" onClick={() => setSelectedTone(tone)} style={{ backgroundColor: selectedTone === tone ? '#C7A758' : undefined }}>{tone}</button>
                ))}
              </div>
              <button onClick={() => handleRequestAI(JOURNAL_AI_MODES.REWRITE)} disabled={!selectedTone}>Rewrite</button>
            </RewriteForm>
          </AIContent>
        );
      default: return null;
    }
  };
  
  return (
    <JournalContainer>
      <JournalHeader>
        <JournalTitle>Journal</JournalTitle>
        <JournalActions>
          <Button variant="secondary" onClick={handleNewEntry}>New Entry</Button>
          <Button 
            variant="primary"
            onClick={handleSave}
            disabled={dbLoading || journalText.trim().length === 0}
          >
            {currentEntry ? 'Save Changes' : 'Save Entry'}
          </Button>
          {currentEntry && <Button variant="primary" style={{backgroundColor: '#8A0303'}} onClick={handleDelete}>Delete</Button>}
        </JournalActions>
      </JournalHeader>
      
      <JournalContent>
        <EditorCard
          key={currentEntry?.id || 'new'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(dbLoading || aiLoading) && (
            <LoadingOverlay>
              <LoadingSpinner />
            </LoadingOverlay>
          )}
          
          <TitleInput 
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            placeholder="Entry Title"
          />
          
          <EditorHeader>
            <DateDisplay>{currentEntry ? new Date(currentEntry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}</DateDisplay>
            <WordCount>{wordCount} words</WordCount>
          </EditorHeader>
          
          <EditorTextarea 
            value={journalText}
            onChange={handleTextChange}
            placeholder="Write your thoughts here..."
          />
          
          <TagsContainer>
            {tags.map(tag => (
              <Tag key={tag}>
                #{tag}
                <span className="remove-tag" onClick={() => handleRemoveTag(tag)}>✕</span>
              </Tag>
            ))}
            <AddTagInput 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleAddTag}
              placeholder="Add tag..."
            />
          </TagsContainer>
          
          <EditorFooter>
            <div>How are you feeling today?</div>
            <MoodGauge mood={mood} setMood={setMood} />
          </EditorFooter>
        </EditorCard>
        
        <SidePanel>
          <AIInsightsCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {(dbLoading || aiLoading) && (
              <LoadingOverlay>
                <LoadingSpinner />
              </LoadingOverlay>
            )}
            
            <AIInsightsTitle>
              <span className="ai-icon">🧠</span>
              AI Assistant
            </AIInsightsTitle>
            
            <AITabs>
              <AITab active={activeAITab === 'insights'} onClick={() => setActiveAITab('insights')}>Insights</AITab>
              <AITab active={activeAITab === 'summary'} onClick={() => setActiveAITab('summary')}>Summary</AITab>
              <AITab active={activeAITab === 'actions'} onClick={() => setActiveAITab('actions')}>Actions</AITab>
              <AITab active={activeAITab === 'ask'} onClick={() => setActiveAITab('ask')}>Ask AI</AITab>
              <AITab active={activeAITab === 'rewrite'} onClick={() => setActiveAITab('rewrite')}>Rewrite</AITab>
            </AITabs>
            
            {renderAIContent()}
          </AIInsightsCard>
          
          <JournalHistoryCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <JournalHistoryTitle>Recent Entries</JournalHistoryTitle>
            
            {dbLoading ? <LoadingSpinner /> : entries.length > 0 ? (
              <JournalEntryList>
                {entries.map(entry => (
                  <JournalEntryItem
                    key={entry.id}
                    isSelected={currentEntry?.id === entry.id}
                    onClick={() => handleSelectEntry(entry)}
                  >
                    <div className="entry-title">{entry.title || 'Untitled Entry'}</div>
                    <div className="entry-preview">{entry.content}</div>
                    <div className="entry-date">{new Date(entry.created_at).toLocaleDateString()}</div>
                  </JournalEntryItem>
                ))}
              </JournalEntryList>
            ) : (
              <EmptyHistoryState>
                No journal entries yet. Start writing!
              </EmptyHistoryState>
            )}
          </JournalHistoryCard>
        </SidePanel>
      </JournalContent>
    </JournalContainer>
  );
};

export default Journal;