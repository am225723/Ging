import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FeedbackContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1rem;
  margin-top: 1rem;
`;

const FeedbackTitle = styled.h4`
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .feedback-icon {
    font-size: 0.9rem;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const RatingButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.muted};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    transform: scale(1.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeedbackOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FeedbackOption = styled.button`
  padding: 0.5rem 0.75rem;
  background-color: ${({ theme, selected }) => 
    selected ? 'rgba(199, 167, 88, 0.2)' : theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme, selected }) => 
    selected ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(199, 167, 88, 0.1);
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ThankYouMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 500;
`;

/**
 * AI Feedback Panel Component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSubmitFeedback - Callback when feedback is submitted
 * @param {Function} props.onClose - Callback when panel is closed
 * @param {Array} props.quickFeedbackOptions - Array of quick feedback options
 */
const AiFeedbackPanel = ({ 
  onSubmitFeedback, 
  onClose,
  quickFeedbackOptions = [
    "Too vague",
    "Too detailed",
    "Not relevant",
    "Very helpful",
    "Needs examples",
    "Misunderstood me"
  ]
}) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  
  const handleOptionToggle = (option) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };
  
  const handleSubmit = () => {
    if (rating === 0) return;
    
    const feedback = {
      rating,
      comments,
      quickFeedback: selectedOptions,
      timestamp: new Date().toISOString()
    };
    
    if (onSubmitFeedback) {
      onSubmitFeedback(feedback);
    }
    
    setSubmitted(true);
    
    // Close after showing thank you message
    setTimeout(() => {
      if (onClose) onClose();
    }, 2000);
  };
  
  return (
    <FeedbackContainer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {!submitted ? (
        <>
          <FeedbackTitle>
            <span className="feedback-icon">💬</span>
            How was this AI response?
          </FeedbackTitle>
          
          <RatingContainer>
            {[1, 2, 3, 4, 5].map(value => (
              <RatingButton 
                key={value} 
                active={rating >= value}
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} stars`}
              >
                ★
              </RatingButton>
            ))}
          </RatingContainer>
          
          <FeedbackOptions>
            {quickFeedbackOptions.map(option => (
              <FeedbackOption 
                key={option}
                selected={selectedOptions.includes(option)}
                onClick={() => handleOptionToggle(option)}
              >
                {option}
              </FeedbackOption>
            ))}
          </FeedbackOptions>
          
          <TextArea 
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Additional comments (optional)"
          />
          
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </ButtonGroup>
        </>
      ) : (
        <ThankYouMessage>
          Thank you for your feedback! We'll use it to improve future responses.
        </ThankYouMessage>
      )}
    </FeedbackContainer>
  );
};

export default AiFeedbackPanel;