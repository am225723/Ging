import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
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
  color: ${({ theme }) => theme.colors.text.primary};
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

const JournalEntryItem = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .entry-date {
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
  
  .entry-mood {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    
    .mood-indicator {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background-color: ${({ mood, theme }) => 
        mood === 'great' ? theme.colors.status.success :
        mood === 'good' ? '#8BBF61' :
        mood === 'neutral' ? theme.colors.accent :
        mood === 'bad' ? '#BF6E61' :
        theme.colors.status.danger};
    }
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

// Sample journal entries
const journalEntries = [
  {
    id: 1,
    date: '2025-09-25',
    title: 'Preparing for Tomorrow',
    content: 'Today I finally defeated the Nameless King after countless attempts. The feeling of accomplishment was incredible.',
    mood: 'great',
    wordCount: 15,
    tags: ['gaming', 'achievement']
  },
  {
    id: 2,
    date: '2025-09-23',
    title: 'Struggling with Malenia',
    content: 'Spent hours trying to beat Malenia but kept failing. I need to rethink my strategy and maybe try a different build.',
    mood: 'bad',
    wordCount: 18,
    tags: ['gaming', 'frustration']
  },
  {
    id: 3,
    date: '2025-09-20',
    title: 'Evo IX Upgrades',
    content: 'Worked on tuning the Evo IX today. The new exhaust sounds amazing, but I still need to adjust the suspension.',
    mood: 'good',
    wordCount: 19,
    tags: ['car', 'project']
  }
];

const Journal = () => {
  const [journalTitle, setJournalTitle] = useState('');
  const [journalText, setJournalText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [mood, setMood] = useState(50); // 0-100 scale
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [activeAITab, setActiveAITab] = useState('insights');
  const [aiResults, setAiResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  const handleTextChange = (e) => {
    const text = e.target.value;
    setJournalText(text);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
  };
  
  const handleSave = () => {
    // In a real app, this would save to a database
    alert('Journal entry saved!');
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
  
  const handleRequestAIInsights = async () => {
    if (journalText.trim().length < 20) return;
    
    setLoading(true);
    try {
      const result = await processJournalEntry(JOURNAL_AI_MODES.INSIGHTS, {
        title: journalTitle,
        content: journalText,
        mood,
        tags
      });
      
      setAiResults({
        ...aiResults,
        insights: result.insights
      });
      
    } catch (error) {
      console.error('Error getting AI insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestAISummary = async () => {
    if (journalText.trim().length < 20) return;
    
    setLoading(true);
    try {
      const result = await processJournalEntry(JOURNAL_AI_MODES.SUMMARIZE, {
        title: journalTitle,
        content: journalText,
        mood,
        tags
      });
      
      setAiResults({
        ...aiResults,
        summary: result.summary
      });
      
    } catch (error) {
      console.error('Error getting AI summary:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestAIActions = async () => {
    if (journalText.trim().length < 20) return;
    
    setLoading(true);
    try {
      const result = await processJournalEntry(JOURNAL_AI_MODES.ACTIONS, {
        title: journalTitle,
        content: journalText,
        mood,
        tags
      });
      
      setAiResults({
        ...aiResults,
        actions: result.actions
      });
      
    } catch (error) {
      console.error('Error getting AI actions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAskAI = async () => {
    if (!askQuestion.trim() || journalText.trim().length < 20) return;
    
    setLoading(true);
    try {
      const result = await processJournalEntry(JOURNAL_AI_MODES.ASK, {
        title: journalTitle,
        content: journalText,
        mood,
        tags,
        question: askQuestion
      });
      
      setAiResults({
        ...aiResults,
        answer: result.answer
      });
      
      setAskQuestion('');
      
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRewriteEntry = async () => {
    if (!selectedTone || journalText.trim().length < 20) return;
    
    setLoading(true);
    try {
      const result = await processJournalEntry(JOURNAL_AI_MODES.REWRITE, {
        title: journalTitle,
        content: journalText,
        mood,
        tags,
        tone: selectedTone
      });
      
      setAiResults({
        ...aiResults,
        rewrite: result.rewrite
      });
      
    } catch (error) {
      console.error('Error rewriting entry:', error);
    } finally {
      setLoading(false);
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
        if (aiResults.insights) {
          return (
            <AIContent>
              <p>{aiResults.insights}</p>
              <Button 
                variant="secondary" 
                onClick={handleRequestAIInsights}
                style={{ marginTop: '1rem' }}
              >
                Refresh Insights
              </Button>
            </AIContent>
          );
        } else {
          return (
            <Button 
              variant="primary" 
              onClick={handleRequestAIInsights}
              disabled={journalText.trim().length < 20}
            >
              <span className="ai-icon">🧠</span>
              Get AI Insights
            </Button>
          );
        }
        
      case 'summary':
        if (aiResults.summary) {
          return (
            <AIContent>
              <p>{aiResults.summary}</p>
              <Button 
                variant="secondary" 
                onClick={handleRequestAISummary}
                style={{ marginTop: '1rem' }}
              >
                Refresh Summary
              </Button>
            </AIContent>
          );
        } else {
          return (
            <Button 
              variant="primary" 
              onClick={handleRequestAISummary}
              disabled={journalText.trim().length < 20}
            >
              <span className="ai-icon">📝</span>
              Summarize Entry
            </Button>
          );
        }
        
      case 'actions':
        if (aiResults.actions) {
          return (
            <AIContent>
              <p>{aiResults.actions}</p>
              <Button 
                variant="secondary" 
                onClick={handleRequestAIActions}
                style={{ marginTop: '1rem' }}
              >
                Refresh Actions
              </Button>
            </AIContent>
          );
        } else {
          return (
            <Button 
              variant="primary" 
              onClick={handleRequestAIActions}
              disabled={journalText.trim().length < 20}
            >
              <span className="ai-icon">✅</span>
              Suggest Actions
            </Button>
          );
        }
        
      case 'ask':
        return (
          <AIContent>
            {aiResults.answer && (
              <div className="suggestion">
                <strong>Answer:</strong> {aiResults.answer}
              </div>
            )}
            
            <AskAIForm>
              <div className="form-header">Ask a question about your journal entry:</div>
              <div className="input-container">
                <input 
                  type="text" 
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  placeholder="e.g., What am I feeling about...?"
                />
                <button 
                  onClick={handleAskAI}
                  disabled={!askQuestion.trim() || journalText.trim().length < 20}
                >
                  Ask
                </button>
              </div>
            </AskAIForm>
          </AIContent>
        );
        
      case 'rewrite':
        return (
          <AIContent>
            {aiResults.rewrite && (
              <div className="suggestion">
                <strong>Rewritten Entry:</strong>
                <p>{aiResults.rewrite}</p>
              </div>
            )}
            
            <RewriteForm>
              <div className="form-header">Select a tone for rewriting:</div>
              <div className="tone-options">
                {['Positive', 'Reflective', 'Analytical', 'Grateful', 'Confident'].map(tone => (
                  <button 
                    key={tone}
                    className="tone-option"
                    style={{
                      backgroundColor: selectedTone === tone ? '#C7A758' : 'transparent',
                      color: selectedTone === tone ? '#1A1A1A' : undefined
                    }}
                    onClick={() => setSelectedTone(tone)}
                  >
                    {tone}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleRewriteEntry}
                disabled={!selectedTone || journalText.trim().length < 20}
              >
                Rewrite Entry
              </button>
            </RewriteForm>
          </AIContent>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <JournalContainer>
      <JournalHeader>
        <JournalTitle>Journal</JournalTitle>
        <JournalActions>
          <Button 
            variant="primary"
            onClick={handleSave}
            disabled={journalText.trim().length === 0}
          >
            Save Entry
          </Button>
        </JournalActions>
      </JournalHeader>
      
      <JournalContent>
        <EditorCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading && (
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
            <DateDisplay>{currentDate}</DateDisplay>
            <WordCount>{wordCount} words</WordCount>
          </EditorHeader>
          
          <EditorTextarea 
            value={journalText}
            onChange={handleTextChange}
            placeholder="Write your thoughts here... How are you feeling today? What's on your mind?"
          />
          
          <TagsContainer>
            {tags.map(tag => (
              <Tag key={tag}>
                #{tag}
                <span 
                  className="remove-tag" 
                  onClick={() => handleRemoveTag(tag)}
                >
                  ✕
                </span>
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
            {loading && (
              <LoadingOverlay>
                <LoadingSpinner />
              </LoadingOverlay>
            )}
            
            <AIInsightsTitle>
              <span className="ai-icon">🧠</span>
              AI Assistant
            </AIInsightsTitle>
            
            <AITabs>
              <AITab 
                active={activeAITab === 'insights'} 
                onClick={() => setActiveAITab('insights')}
              >
                Insights
              </AITab>
              <AITab 
                active={activeAITab === 'summary'} 
                onClick={() => setActiveAITab('summary')}
              >
                Summary
              </AITab>
              <AITab 
                active={activeAITab === 'actions'} 
                onClick={() => setActiveAITab('actions')}
              >
                Actions
              </AITab>
              <AITab 
                active={activeAITab === 'ask'} 
                onClick={() => setActiveAITab('ask')}
              >
                Ask AI
              </AITab>
              <AITab 
                active={activeAITab === 'rewrite'} 
                onClick={() => setActiveAITab('rewrite')}
              >
                Rewrite
              </AITab>
            </AITabs>
            
            {renderAIContent()}
          </AIInsightsCard>
          
          <JournalHistoryCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <JournalHistoryTitle>Recent Entries</JournalHistoryTitle>
            
            {journalEntries.length > 0 ? (
              <JournalEntryList>
                {journalEntries.map(entry => (
                  <JournalEntryItem key={entry.id} mood={entry.mood}>
                    <div className="entry-date">
                      {entry.title} - {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="entry-preview">{entry.content}</div>
                    <div className="entry-mood">
                      <div className="mood-indicator"></div>
                      <span>{entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} mood • {entry.wordCount} words</span>
                    </div>
                  </JournalEntryItem>
                ))}
              </JournalEntryList>
            ) : (
              <EmptyHistoryState>
                No journal entries yet. Start writing to build your history.
              </EmptyHistoryState>
            )}
          </JournalHistoryCard>
        </SidePanel>
      </JournalContent>
    </JournalContainer>
  );
};

export default Journal;